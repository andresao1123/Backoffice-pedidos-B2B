import { db } from '../db.js';

import {
    createOrderSchema,
    orderIdParamSchema,
    idempotencyHeaderSchema,
    listOrdersQuerySchema
} from '../validators/order_schema.js';
import { validate } from '../utils/validate.js';

export const createOrder = async (req, res) => {
    const body = validate(createOrderSchema, req.body, res);
    if (!body) return;

    const { customer_id, items } = body;

    let customerResponse;
    try {
        customerResponse = await fetch(
            `${process.env.CUSTOMERS_API_BASE}/internal/customers/${customer_id}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
                },
            }
        );
    } catch {
        return res.status(502).json({ error: 'Servicio de clientes no disponible' });
    }

    if (!customerResponse.ok) {
        return res.status(404).json({
            error: 'Customer no existe'
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
            if (!product) throw { status: 404, message: `Producto ${item.product_id} no existe` };
            if (product.stock < item.qty)
                throw {
                    status: 400,
                    message: `Stock insuficiente para producto ${item.product_id}`
                };
        }

        let total_cents = 0;
        const orderItemsData = [];

        for (const item of items) {
            const [[product]] = await db.query(
                'SELECT price_cents FROM products WHERE id = ?',
                [item.product_id]
            );

            const subtotal = product.price_cents * item.qty;
            total_cents += subtotal;

            orderItemsData.push({
                product_id: item.product_id,
                qty: item.qty,
                unit_price_cents: product.price_cents,
                subtotal_cents: subtotal,
            });
        }

        const [orderResult] = await db.query(
            'INSERT INTO orders (customer_id, status, total_cents) VALUES (?, ?, ?)',
            [customer_id, 'CREATED', total_cents]
        );

        const orderId = orderResult.insertId;

        for (const item of orderItemsData) {
            await db.query(
                `INSERT INTO order_items
         (order_id, product_id, qty, unit_price_cents, subtotal_cents)
         VALUES (?, ?, ?, ?, ?)`,
                [
                    orderId,
                    item.product_id,
                    item.qty,
                    item.unit_price_cents,
                    item.subtotal_cents,
                ]
            );
        }

        for (const item of items) {
            await db.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.qty, item.product_id]
            );
        }

        await db.query('COMMIT');

        res.status(201).json({
            id: orderId,
            customer_id,
            status: 'CREATED',
            total_cents,
            items: orderItemsData,
        });
    } catch (error) {
        await db.query('ROLLBACK');
        return res.status(error.status || 400).json({
            error: error.message || 'Error al crear orden'
        });
    }
};


export const confirmOrder = async (req, res) => {
    const result = idempotencyHeaderSchema.safeParse(req.headers);
    if (!result.success) {
        return res.status(422).json({ error: 'X-Idempotency-Key requerido' });
    }

    const headers = result.data;

    const params = validate(orderIdParamSchema, req.params, res);
    if (!params) return;

    const idempotencyKey = headers['x-idempotency-key'];

    const orderId = params.id;


    const [rows] = await db.query(
        `SELECT * FROM idempotency_keys 
     WHERE \`key\` = ? AND target_type = 'order_confirm'`,
        [idempotencyKey]
    );

    const existingKey = rows[0];

    if (existingKey && existingKey.status === 'SUCCESS') {
        if (existingKey.target_id !== parseInt(orderId)) {
            console.log(`Detectado reintento con nuevo ID (${orderId}). Cancelando el duplicado...`);
            try {
                await performOrderCancellation(orderId);
            } catch (err) {
                console.error("Error al cancelar orden duplicada:", err.message);
            }
        }
        const cachedResponse = typeof existingKey.response_body === 'string'
            ? JSON.parse(existingKey.response_body)
            : existingKey.response_body;
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

        const [items] = await db.query(
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
    const params = validate(orderIdParamSchema, req.params, res);
    if (!params) return;

    const orderId = params.id;

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

    try {
        await performOrderCancellation(orderId);
        return res.status(200).json({ id: orderId, status: 'CANCELED' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const getOrder = async (req, res) => {
    const params = validate(orderIdParamSchema, req.params, res);
    if (!params) return;

    const orderId = params.id;

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
};


export const listOrders = async (req, res) => {
    const query = validate(listOrdersQuerySchema, req.query, res);
    if (!query) return;

    const { status, from, to, cursor, limit = 20 } = query;

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

    res.status(200).json({
        data: orders,
        next_cursor: nextCursor
    });
};

const performOrderCancellation = async (orderId) => {
    await db.query('START TRANSACTION');
    try {
        const [items] = await db.query(
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
        return { success: true };
    } catch (error) {
        await db.query('ROLLBACK');
        throw error;
    }
};

