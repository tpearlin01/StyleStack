const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const emailRoutes = require('./routes/emailRoutes');
const mongoose = require('mongoose');
const errorHandler = require('../middleware/errorHandler');

const app = express();

// Enable gzip compression for all responses
app.use(compression());

// CORS configuration: accept localhost, configured CLIENT_URL, and Azure Static Web Apps domains
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const getCustomOrigins = () => {
  if (!process.env.CLIENT_URL) return [];
  return process.env.CLIENT_URL.split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, '');
      const allowed = [...defaultAllowedOrigins, ...getCustomOrigins()];

      // Allow listed origins or any Azure Static Web Apps subdomain
      if (
        allowed.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.azurestaticapps.net') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS origin "${origin}" not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check route
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    message: 'StyleStack API is healthy',
    database: isMongoConnected ? 'mongodb' : 'local_json_fallback',
    timestamp: new Date(),
  });
});

// Modular API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/payment/email', emailRoutes); // backward-compatible alias

// 404 handler for unknown routes
app.all(/^\/api(\/.*)?$/, (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
