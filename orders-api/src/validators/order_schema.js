import { z } from 'zod';


export const orderIdParamSchema = z.object({
    id: z.coerce.number({
        invalid_type_error: 'id debe ser un número',
        required_error: 'id es requerido',
    }).int().positive('id debe ser mayor a 0'),
});


const orderItemSchema = z.object({
    product_id: z.number({
        invalid_type_error: 'product_id debe ser un número',
        required_error: 'product_id es requerido',
    }).int().positive('product_id debe ser mayor a 0'),

    qty: z.number({
        invalid_type_error: 'qty debe ser un número',
        required_error: 'qty es requerido',
    }).int().positive('qty debe ser mayor a 0'),
});


export const createOrderSchema = z.object({
    customer_id: z.number({
        invalid_type_error: 'customer_id debe ser un número',
        required_error: 'customer_id es requerido',
    }).int().positive('customer_id debe ser mayor a 0'),

    items: z.array(orderItemSchema, {
        invalid_type_error: 'items debe ser un array',
        required_error: 'items es requerido',
    }).min(1, 'items debe tener al menos un elemento'),
});


export const idempotencyHeaderSchema = z.object({
    'x-idempotency-key': z.string({
        required_error: 'X-Idempotency-Key requerido',
        invalid_type_error: 'X-Idempotency-Key inválido',
    }).min(1, 'X-Idempotency-Key requerido'),
});


export const listOrdersQuerySchema = z.object({
    status: z.enum(['CREATED', 'CONFIRMED', 'CANCELED'], {
        invalid_type_error: 'status inválido',
    }).optional(),

    from: z.string({
        invalid_type_error: 'from debe ser una fecha válida',
    }).optional(),

    to: z.string({
        invalid_type_error: 'to debe ser una fecha válida',
    }).optional(),

    cursor: z.coerce.number({
        invalid_type_error: 'cursor debe ser un número',
    }).int().positive('cursor debe ser mayor a 0').optional(),

    limit: z.coerce.number({
        invalid_type_error: 'limit debe ser un número',
    }).int().positive('limit debe ser mayor a 0').default(20),
});
