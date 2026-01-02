import { db } from '../db.js';

export const createOrder = async (req, res) => {
    const { customer_id, items } = req.body
    if (typeof customer_id !== 'number') {
        return res.status(400).json({ error: 'customer_id debe ser un número' })
    }
    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items debe ser un array' })
    }
    if (items.length === 0) {
        return res.status(400).json({ error: 'items debe tener al menos un elemento' })
    }

    var validItems = items.every(item => {
        return item.qty > 0 && item.product_id > 0
    })

    if (!validItems) {
        return res.status(400).json({ error: 'todos los items deben tener product_id y quantity mayores a 0' })
    }

    let customerResponse;
    try {
        customerResponse = await fetch(
            `${process.env.CUSTOMERS_API_BASE}/internal/customers/${customer_id}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SERVICE_TOKEN}`
                }
            }
        );
    } catch (err) {
        console.error('Error llamando Customers API:', err.message);
        return res.status(502).json({
            error: 'Customers service unavailable'
        });
    }

    await db.query('START TRANSACTION');

    try {
        for (const item of items) {
            const [rows] = await db.query(
                'SELECT id, price_cents, stock FROM products WHERE id = ? FOR UPDATE',
                [item.product_id]
            );
            const product = rows[0];

            if (!product) {
                throw new Error(`Producto ${item.product_id} no existe`);
            }

            if (product.stock < item.qty) {
                throw new Error(`Stock insuficiente para producto ${item.product_id}`);
            }
        }

        let total_cents = 0;
        const orderItemsData = [];

        for (const item of items) {
            const [rows] = await db.query(
                'SELECT price_cents FROM products WHERE id = ?',
                [item.product_id]
            );
            const product = rows[0];

            const subtotal = product.price_cents * item.qty;
            total_cents += subtotal;

            orderItemsData.push({
                product_id: item.product_id,
                qty: item.qty,
                unit_price_cents: product.price_cents,
                subtotal_cents: subtotal
            });
        }

        const [orderResult] = await db.query(
            'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, ?, ?)',
            [customer_id, 'CREATED', total_cents]
        );

        const orderId = orderResult.insertId;

        for (const itemData of orderItemsData) {
            await db.query(
                `INSERT INTO order_items 
                (order_id, product_id, qty, unit_price_cents, subtotal_cents) 
                VALUES (?, ?, ?, ?, ?)`,
                [orderId, itemData.product_id, itemData.qty,
                    itemData.unit_price_cents, itemData.subtotal_cents]
            );
        }

        for (const item of items) {
            await db.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.qty, item.product_id]
            );
        }

        await db.query('COMMIT');
        return res.status(201).json({
            id: orderId,
            customer_id,
            status: 'CREATED',
            total_cents,
            items: orderItemsData
        });

    } catch (error) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: error.message });
    }
}

export const confirmOrder = async (req, res) => {

    const idempotencyKey = req.headers['x-idempotency-key'];

    if (!idempotencyKey) {
        return res.status(422).json({ error: 'X-Idempotency-Key requerido' });
    }

    const orderId = req.params.id;


    const [existingKey] = await db.query(
        `SELECT * FROM idempotency_keys 
         WHERE \`key\` = ? AND target_type = 'order_confirm' AND target_id = ?`,
        [idempotencyKey, orderId]
    );

    if (existingKey && existingKey.status === 'SUCCESS') {
        const cachedResponse = JSON.parse(existingKey.response_body);
        return res.status(200).json(cachedResponse);
    }
    if (existingKey && existingKey.status === 'FAILED') {
        await db.query('DELETE FROM idempotency_keys WHERE `key` = ?', [idempotencyKey]);
    }

    await db.query(
        `INSERT INTO idempotency_keys 
         (\`key\`, target_type, target_id, status, response_body, created_at, expires_at) 
         VALUES (?, 'order_confirm', ?, 'PROCESSING', '{}', NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
        [idempotencyKey, orderId]
    );
    await db.query('START TRANSACTION');

    try {
        const [rows] = await db.query(
            'SELECT * FROM orders WHERE id = ? FOR UPDATE',
            [orderId]
        );
        const order = rows[0];

        if (!order) {
            await db.query('ROLLBACK');

            await db.query(
                `UPDATE idempotency_keys 
                SET status = 'FAILED', response_body = ? 
                WHERE \`key\` = ?`,
                [JSON.stringify({ error: 'Orden no encontrada' }), idempotencyKey]
            );
            return res.status(404).json({ error: 'Orden no encontrada' });
        }


        if (order.status !== 'CREATED') {
            await db.query('ROLLBACK');
            await db.query(
                `UPDATE idempotency_keys SET status = 'FAILED', response_body = ? WHERE \`key\` = ?`,
                [JSON.stringify({ error: 'Orden no encontrada' }), idempotencyKey]
            );
            return res.status(409).json({ error: `Orden ya está en estado ${order.status}` });
        }

        await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['CONFIRMED', orderId]
        );

        const items = await db.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderId]
        );

        const response = {
            id: order.id,
            customer_id: order.customer_id,
            status: 'CONFIRMED',
            total_cents: order.total_cents,
            items: items
        };

        await db.query(
            `UPDATE idempotency_keys 
            SET status = 'SUCCESS', response_body = ? 
            WHERE \`key\` = ?`,
            [JSON.stringify(response), idempotencyKey]
        );

        await db.query('COMMIT');

        return res.status(200).json(response);

    } catch (error) {
        await db.query('ROLLBACK');

        await db.query(
            `UPDATE idempotency_keys 
            SET status = 'FAILED', response_body = ? 
            WHERE \`key\` = ?`,
            [JSON.stringify({ error: error.message }), idempotencyKey]
        );

        return res.status(500).json({ error: error.message });

    }
}

export const cancelOrder = async (req, res) => {
    const orderId = req.params.id;

    if (!orderId) {
        return res.status(400).json({ error: 'ID de orden requerido' });
    }

    const [rows] = await db.query(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
    );
    const order = rows[0];

    if (!order) {
        return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (order.status === 'CREATED') {

    } else if (order.status === 'CONFIRMED') {
        const createdAt = new Date(order.created_at);
        const now = new Date();
        const minutesPassed = (now - createdAt) / (1000 * 60);

        if (minutesPassed > 10) {
            return res.status(400).json({
                error: 'No se puede cancelar una orden confirmada después de 10 minutos'
            });
        }

    } else if (order.status === 'CANCELED') {
        return res.status(400).json({ error: 'Orden ya está cancelada' });
    }

    await db.query('START TRANSACTION');

    try {
        const items = await db.query(
            'SELECT product_id, qty FROM order_items WHERE order_id = ?',
            [orderId]
        );

        for (const item of items) {
            await db.query(
                'UPDATE products SET stock = stock + ? WHERE id = ?',
                [item.qty, item.product_id]
            );
        }

        await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['CANCELED', orderId]
        );

        await db.query('COMMIT');

        return res.status(200).json({
            id: orderId,
            status: 'CANCELED',
            message: 'Orden cancelada y stock restaurado'
        });

    } catch (error) {
        await db.query('ROLLBACK');
        return res.status(500).json({ error: error.message });
    }
}

export const getOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        if (!orderId) {
            return res.status(400).json({ error: 'ID de orden requerido' });
        }


        const [orders] = await db.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const order = orders[0];

        const [items] = await db.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [orderId]
        );

        order.items = items || [];

        return res.status(200).json(order);

    } catch (error) {
        console.error('Error al obtener orden:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};


export const listOrders = async (req, res) => {
    const { status, from, to, cursor, limit = 20 } = req.query;

    const params = [];
    let where = 'WHERE 1=1';

    if (status) {
        where += ' AND status = ?';
        params.push(status);
    }

    if (from) {
        where += ' AND created_at >= ?';
        params.push(from);
    }

    if (to) {
        where += ' AND created_at <= ?';
        params.push(to);
    }

    if (cursor) {
        where += ' AND id > ?';
        params.push(Number(cursor));
    }

    const limitNumber = Number(limit);
    if (isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ error: 'limit debe ser un número positivo' });
    }

    const [orders] = await db.query(
        `
    SELECT * FROM orders
    ${where}
    ORDER BY id ASC
    LIMIT ?
    `,
        [...params, limitNumber]
    );

    const nextCursor =
        orders.length > 0 ? orders[orders.length - 1].id : null;

    res.json({
        data: orders,
        next_cursor: nextCursor
    });
};

