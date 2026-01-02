import { db } from '../db.js';

export const getCustomers = async (req, res) => {
    const { search, cursor, limit = 20 } = req.query;

    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
        where += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }

    if (cursor) {
        where += ' AND id > ?';
        params.push(Number(cursor));
    }

    const limitNumber = Number(limit);
    if (isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ error: 'limit debe ser un número positivo' });
    }

    const [customers] = await db.query(
        `
    SELECT * FROM customers
    ${where} and deleted_at IS NULL
    ORDER BY id ASC
    LIMIT ?
    `,
        [...params, limitNumber]
    );

    const nextCursor =
        customers.length > 0 ? customers[customers.length - 1].id : null;

    res.json({
        data: customers,
        next_cursor: nextCursor,
    });
}

export const createCustomer = async (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            error: 'name, email y phone son requeridos'
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO customers (name, email, phone)
       VALUES (?, ?, ?)`,
            [name, email, phone]
        );

        return res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                email,
                phone
            }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'Email ya existe'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

export const getCustomer = async (req, res) => {
    const customerId = req.params.id;

    if (!customerId) {
        return res.status(400).json({
            success: false,
            error: 'Customer ID is required'
        });
    }

    const [rows] = await db.query(
        'SELECT * FROM customers WHERE id = ? and deleted_at IS NULL',
        [customerId]
    );

    if (rows.length === 0) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found'
        });
    }

    const customer = rows[0];
    delete customer.deleted_at;

    res.json({
        success: true,
        data: customer
    });
};

export const updateCustomer = async (req, res) => {
    const customerId = Number(req.params.id);
    const { name, email, phone } = req.body;

    if (!Number.isInteger(customerId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    if (name == null && email == null && phone == null) {
        return res.status(400).json({
            error: 'Debe enviar name, email y/o phone'
        });
    }

    const fields = [];
    const values = [];

    if (name != null) {
        if (typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                error: 'name debe ser una cadena no vacía'
            });
        }
        fields.push('name = ?');
        values.push(name);
    }

    if (email != null) {
        if (typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({
                error: 'email debe ser una cadena no vacía'
            });
        }
        fields.push('email = ?');
        values.push(email);
    }

    if (phone != null) {
        if (typeof phone !== 'string' || phone.trim() === '') {
            return res.status(400).json({
                error: 'phone debe ser una cadena no vacía'
            });
        }
        fields.push('phone = ?');
        values.push(phone);
    }

    try {
        const [result] = await db.query(
            `
      UPDATE customers
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
            [...values, customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const [[customer]] = await db.query(
            'SELECT * FROM customers WHERE id = ?',
            [customerId]
        );

        return res.json({
            success: true,
            data: customer
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    const customerId = Number(req.params.id);

    if (!Number.isInteger(customerId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const [result] = await db.query(
            `
            UPDATE customers
            SET deleted_at = NOW()
            WHERE id = ?
              AND deleted_at IS NULL
            `,
            [customerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Customer not found or already deleted'
            });
        }

        return res.json({
            success: true,
            data: { id: customerId }
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

