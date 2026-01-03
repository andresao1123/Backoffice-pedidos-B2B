import { z } from 'zod';

const orderItemSchema = z.object({
    product_id: z.number({
        invalid_type_error: 'product_id debe ser un número',
    }).int().positive('product_id debe ser mayor a 0'),

    qty: z.number({
        invalid_type_error: 'qty debe ser un número',
    }).int().positive('qty debe ser mayor a 0'),
});

export const createAndConfirmOrderSchema = z.object({
    customer_id: z.number({
        required_error: 'customer_id es requerido',
        invalid_type_error: 'customer_id debe ser un número',
    }).int().positive(),

    items: z.array(orderItemSchema, {
        required_error: 'items es requerido',
        invalid_type_error: 'items debe ser un array',
    }).min(1, 'items debe tener al menos un elemento'),

    idempotency_key: z.string({
        required_error: 'idempotency_key es requerido',
    }).min(1, 'idempotency_key es requerido'),

    correlation_id: z
        .string()
        .max(64, 'correlation_id demasiado largo')
        .optional(),
});
