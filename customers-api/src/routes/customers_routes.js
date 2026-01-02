import { Router } from "express";
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from "../controllers/customers_controller.js";
import { internalAuth } from "../middleware/middleware.js";

const user_router = Router();

user_router.get('/internal/customers/:id', internalAuth, getCustomer);
user_router.get('/customers', getCustomers);
user_router.get('/customers/:id', getCustomer);
user_router.post('/customers', createCustomer);
user_router.put('/customers/:id', updateCustomer);
user_router.delete('/customers/:id', deleteCustomer);

export default user_router;