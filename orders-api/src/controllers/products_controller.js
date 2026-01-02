import { db } from "../db.js";

export const getProducts = async (req, res) => {

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

    const [products] = await db.query(
        `
    SELECT * FROM products
    ${where}
    ORDER BY id ASC
    LIMIT ?
    `,
        [...params, limit]
    );

    const nextCursor =
        products.length > 0 ? products[products.length - 1].id : null;

    res.json({
        data: products,
        next_cursor: nextCursor,
    });
};

export const getProduct = async (req, res) => {
    const productId = req.params.id;

    if (!productId) {
        return res.status(400).json({
            success: false,
            error: 'Product ID is required'
        });
    }

    const [product] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [productId]
    );

    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Product not found'
        });
    }

    res.json({
        success: true,
        data: product
    });
};

export const createProduct = async (req, res) => {
    const { name, sku, price_cents, stock } = req.body;
    if (!name || !sku || price_cents == null || stock == null) {
        return res.status(400).json({
            success: false,
            error: 'name, sku, price_cents y stock son requeridos'
        });
    }

    if (typeof price_cents !== 'number' || price_cents <= 0) {
        return res.status(400).json({
            success: false,
            error: 'price_cents debe ser un número mayor a 0'
        });
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
            success: false,
            error: 'stock debe ser un entero >= 0'
        });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO products (name, sku, price_cents, stock)
       VALUES (?, ?, ?, ?)`,
            [name, sku, price_cents, stock]
        );

        return res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                sku,
                price_cents,
                stock
            }
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                error: 'SKU ya existe'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    const productId = Number(req.params.id);
    const { price_cents, stock } = req.body;

    if (!Number.isInteger(productId)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    if (price_cents == null && stock == null) {
        return res.status(400).json({
            error: 'Debe enviar price_cents y/o stock'
        });
    }

    const fields = [];
    const values = [];

    if (price_cents != null) {
        if (typeof price_cents !== 'number' || price_cents <= 0) {
            return res.status(400).json({
                error: 'price_cents debe ser un número mayor a 0'
            });
        }
        fields.push('price_cents = ?');
        values.push(price_cents);
    }

    if (stock != null) {
        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                error: 'stock debe ser un entero >= 0'
            });
        }
        fields.push('stock = ?');
        values.push(stock);
    }

    try {
        const [result] = await db.query(
            `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
            [...values, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        const [[product]] = await db.query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        return res.json({
            success: true,
            data: product
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

