const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const dbPool = require('./config/db');
const { connectRedis } = require('./config/redisClient');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SecureSeat Backend is running' });
});

// Import Routes (To be created next)
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes');
const securityRoutes = require('./routes/securityRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/security', securityRoutes);
const startServer = async () => {
    try {
        // Ensure Redis connects before starting server
        await connectRedis();
        
        // Verify PostgreSQL connection
        const client = await dbPool.connect();
        console.log('Connected to PostgreSQL successfully');
        client.release();

        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();