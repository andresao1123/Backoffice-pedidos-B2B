import { z } from 'zod';

export const getProductsQuerySchema = z.object({
    search: z.string().optional(),
    cursor: z.coerce.number({
        invalid_type_error: 'cursor debe ser un número',
    }).int().positive().optional(),
    limit: z.coerce.number({
        invalid_type_error: 'limit debe ser un número positivo',
    }).int().positive().default(20),
});

export const productIdParamSchema = z.object({
    id: z.coerce.number({
        invalid_type_error: 'ID inválido',
    }).int().positive(),
});

export const createProductSchema = z.object({
    name: z.string({
        required_error: 'name es requerido',
    }).min(1, 'name es requerido'),

    sku: z.string({
        required_error: 'sku es requerido',
    }).min(1, 'sku es requerido'),

    price_cents: z.number({
        required_error: 'price_cents es requerido',
        invalid_type_error: 'price_cents debe ser un número mayor a 0',
    }).positive('price_cents debe ser un número mayor a 0'),

    stock: z.number({
        required_error: 'stock es requerido',
        invalid_type_error: 'stock debe ser un entero >= 0',
    }).int().min(0, 'stock debe ser un entero >= 0'),
});

export const updateProductSchema = z.object({
    price_cents: z.number({
        invalid_type_error: 'price_cents debe ser un número mayor a 0',
    }).positive().optional(),

    stock: z.number({
        invalid_type_error: 'stock debe ser un entero >= 0',
    }).int().min(0).optional(),
}).refine(
    data => Object.keys(data).length > 0,
    { message: 'Debe enviar price_cents y/o stock' }
);
