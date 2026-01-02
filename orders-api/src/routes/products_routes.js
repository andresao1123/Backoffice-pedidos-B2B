import { Router } from "express";
import { createProduct, getProducts, getProduct, updateProduct } from "../controllers/products_controller.js";

const products_router = Router();

products_router.get('/', getProducts);
products_router.get('/:id', getProduct);
products_router.post('/', createProduct);
products_router.patch('/:id', updateProduct);

export default products_router;