import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { validateLambda } from './utils/validateLambda.js';
import { createAndConfirmOrderSchema } from './validators/orchestrator_schema.js';

const CUSTOMERS_API = process.env.CUSTOMERS_API_BASE || 'http://localhost:3001';
const ORDERS_API = process.env.ORDERS_API_BASE || 'http://localhost:3002';
const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'secret-service-token';

export const createAndConfirmOrder = async (event) => {
    try {
        const body = JSON.parse(event.body);

        const validation = validateLambda(createAndConfirmOrderSchema, body);
        if (validation.error) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: validation.error,
                }),
            };
        }

        const { customer_id, items, idempotency_key } = body;
        let { correlation_id } = body;


        if (!correlation_id) {
            correlation_id = uuidv4();
        }

        if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    correlationId: correlation_id,
                    error: 'customer_id e items son requeridos'
                })
            };
        }

        if (!idempotency_key) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    success: false,
                    correlationId: correlation_id,
                    error: 'idempotency_key es requerido'
                })
            };
        }

        console.log(`[${correlation_id}] Iniciando orquestación para customer ${customer_id}`);

        console.log(`[${correlation_id}] Validando cliente...`);

        console.log(`${CUSTOMERS_API}/internal/customers/${customer_id}`);

        let customer;
        try {
            const customerResponse = await axios.get(
                `${CUSTOMERS_API}/internal/customers/${customer_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${SERVICE_TOKEN}`
                    }
                }
            );
            customer = customerResponse.data.data;
        } catch (error) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    success: false,
                    correlationId: correlation_id,
                    error: 'Cliente no encontrado',
                    details: error.response?.data
                })
            };
        }

        console.log(`[${correlation_id}] Cliente validado: ${customer.name}`);

        console.log(`[${correlation_id}] Creando orden...`);

        let order;
        try {
            const orderResponse = await axios.post(
                `${ORDERS_API}/orders`,
                {
                    customer_id,
                    items
                },
                {
                    headers: {
                        'Authorization': `Bearer ${SERVICE_TOKEN}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            order = orderResponse.data;
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    correlationId: correlation_id,
                    error: 'Error al crear la orden',
                    details: error.response?.data
                })
            };
        }

        console.log(`[${correlation_id}] Orden creada: ${order.id}`);

        console.log(`[${correlation_id}] Confirmando orden...`);

        let confirmedOrder;
        try {
            const confirmResponse = await axios.post(
                `${ORDERS_API}/orders/${order.id}/confirm`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${SERVICE_TOKEN}`,
                        'X-Idempotency-Key': idempotency_key
                    }
                }
            );
            confirmedOrder = confirmResponse.data;

            if (confirmedOrder.id !== order.id) {
                console.log(`[${correlation_id}] Info: Se utilizó la orden original ${confirmedOrder.id}. La orden duplicada ${order.id} fue descartada.`);
            }
        } catch (error) {
            try {
                await axios.post(`${ORDERS_API}/orders/${order.id}/cancel`);
            } catch (cancelError) {
                console.error('Error al cancelar orden:', cancelError);
            }

            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    correlationId: correlation_id,
                    error: 'Error al confirmar la orden',
                    details: error.response?.data
                })
            };
        }

        console.log(`[${correlation_id}] Orden confirmada exitosamente`);

        const response = {
            success: true,
            correlationId: correlation_id,
            data: {
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone
                },
                order: {
                    id: confirmedOrder.id,
                    status: confirmedOrder.status,
                    total_cents: confirmedOrder.total_cents,
                    items: confirmedOrder.items
                }
            }
        };

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(response)
        };

    } catch (error) {
        console.error('Error en orchestrator:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            })
        };
    }
};

export const health = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ status: 'ok' })
    };
};