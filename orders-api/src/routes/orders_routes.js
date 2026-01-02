import { Router } from "express";
import { createOrder, getOrder, listOrders, confirmOrder } from "../controllers/orders_controller.js";

const order_router = Router();

order_router.post('/', createOrder);
order_router.get('/:id', getOrder);
order_router.get('/', listOrders);
order_router.post('/:id/confirm', confirmOrder);

export default order_router;
