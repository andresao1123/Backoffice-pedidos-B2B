import { z } from 'zod';


export const getCustomersQuerySchema = z.object({
    search: z.string({
        invalid_type_error: 'search debe ser una cadena',
    }).optional(),

    cursor: z.coerce.number({
        invalid_type_error: 'cursor debe ser un número',
    })
        .int()
        .positive('cursor debe ser un número positivo')
        .optional(),

    limit: z.coerce.number({
        invalid_type_error: 'limit debe ser un número',
    })
        .int()
        .positive('limit debe ser un número positivo')
        .default(20),
});

export const customerIdParamSchema = z.object({
    id: z.coerce.number({
        invalid_type_error: 'ID inválido',
        required_error: 'ID inválido',
    })
        .int()
        .positive('ID inválido'),
});


export const createCustomerSchema = z.object({
    name: z.string({
        required_error: 'name, email y phone son requeridos',
        invalid_type_error: 'name debe ser una cadena no vacía',
    }).min(1, 'name debe ser una cadena no vacía'),

    email: z.string({
        required_error: 'name, email y phone son requeridos',
        invalid_type_error: 'email debe ser una cadena no vacía',
    }).email('email debe ser válido'),

    phone: z.string({
        required_error: 'name, email y phone son requeridos',
        invalid_type_error: 'phone debe ser una cadena no vacía',
    }).min(1, 'phone debe ser una cadena no vacía'),
});


export const updateCustomerSchema = z
    .object({
        name: z.string({
            invalid_type_error: 'name debe ser una cadena no vacía',
        }).min(1, 'name debe ser una cadena no vacía').optional(),

        email: z.string({
            invalid_type_error: 'email debe ser una cadena no vacía',
        }).email('email debe ser válido').optional(),

        phone: z.string({
            invalid_type_error: 'phone debe ser una cadena no vacía',
        }).min(1, 'phone debe ser una cadena no vacía').optional(),
    })
    .refine(
        data => Object.keys(data).length > 0,
        { message: 'Debe enviar name, email y/o phone' }
    );
