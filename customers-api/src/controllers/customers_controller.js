import { db } from '../db.js';
import { getCustomersQuerySchema, customerIdParamSchema, createCustomerSchema, updateCustomerSchema } from '../validators/customer_schema.js';
import { validate } from '../utils/validate.js';

export const getCustomers = async (req, res) => {
    const query = validate(getCustomersQuerySchema, req.query, res);
    if (!query) return;

    const { search, cursor, limit } = query;

    const params = [];
    let where = 'WHERE deleted_at IS NULL';

    if (search) {
        where += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }

    if (cursor) {
        where += ' AND id > ?';
        params.push(cursor);
    }

    const [rows] = await db.query(
        `
    SELECT id,name,email,phone FROM customers
    ${where} and deleted_at IS NULL
    ORDER BY id ASC
    LIMIT ?
    `,
        [...params, limit + 1]
    );

    const hasMore = rows.length > limit;
    const customers = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? customers[customers.length - 1].id : null;

    res.json({ data: customers, next_cursor: nextCursor });
};

export const createCustomer = async (req, res) => {
    const body = validate(createCustomerSchema, req.body, res);
    if (!body) return;

    const { name, email, phone } = body;

    try {
        const [result] = await db.query(
            `INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)`,
            [name, email, phone]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, name, email, phone },
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email ya existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getCustomer = async (req, res) => {
    const params = validate(customerIdParamSchema, req.params, res);
    if (!params) return;

    const [rows] = await db.query(
        'SELECT id,name,email,phone FROM customers WHERE id = ? AND deleted_at IS NULL',
        [params.id]
    );

    if (!rows.length) {
        return res.status(404).json({ error: 'Customer not found' });
    }


    res.json({ success: true, data: rows[0] });
};

export const updateCustomer = async (req, res) => {
    const params = validate(customerIdParamSchema, req.params, res);
    if (!params) return;

    const body = validate(updateCustomerSchema, req.body, res);
    if (!body) return;

    const fields = Object.keys(body).map(k => `${k} = ?`);
    const values = Object.values(body);

    const [result] = await db.query(
        `
    UPDATE customers
    SET ${fields.join(', ')}
    WHERE id = ? and deleted_at IS NULL
    `,
        [...values, params.id]
    );

    if (!result.affectedRows) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const [[customer]] = await db.query(
        'SELECT * FROM customers WHERE id = ?',
        [params.id]
    );

    res.json({ success: true, data: customer });
};

export const deleteCustomer = async (req, res) => {
    const params = validate(customerIdParamSchema, req.params, res);
    if (!params) return;

    const [result] = await db.query(
        `
    UPDATE customers
    SET deleted_at = NOW()
    WHERE id = ? AND deleted_at IS NULL
    `,
        [params.id]
    );

    if (!result.affectedRows) {
        return res.status(404).json({
            error: 'Customer not found or already deleted',
        });
    }

    res.json({ success: true, data: { id: params.id } });
};

