import express from 'express';
import products_router from './routes/products_routes.js';
import orders_router from './routes/orders_routes.js';


const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Orders API' });
});

app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use('/products', products_router);
app.use('/orders', orders_router);

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});