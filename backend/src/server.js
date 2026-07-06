
// startServer();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const dbPool = require('./config/db');
const { connectRedis } = require('./config/redisClient'); // get module from redisClient.js in /config

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:3000',
    ];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (like curl, Postman) or from configured origins
    // Also allow local development origins.
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.startsWith('http://0.0.0.0')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'SecureSeat Backend is running' });
});

// Import Routes 
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes');
const securityRoutes = require('./routes/securityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Telling which route to use when a particular api call is done 
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stadiums', stadiumRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/payments', paymentRoutes);

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