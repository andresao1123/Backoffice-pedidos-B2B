import express from 'express';
import user_router from './routes/customers_routes.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Customers API' });
});

app.get('/health', (req, res) => {
    return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use(user_router);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});