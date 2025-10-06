const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();
const cors = require('cors');
const passport = require('passport');
const cookieSession = require('cookie-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'secretkey'],
  maxAge: 24 * 60 * 60 * 1000
}));
// Passport / Google OAuth (configured conditionally)
require('./config/passport')(app);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/authors', require('./routes/authors'));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Books and Authors API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      // Startup warnings about missing critical secrets
      if (!process.env.JWT_SECRET) {
        console.warn('Warning: JWT_SECRET is not set. Register/login that sign JWTs will fail. Set JWT_SECRET in your .env or deployment environment.');
      }
      if (!process.env.SESSION_SECRET) {
        console.warn('Warning: SESSION_SECRET is not set. Cookie session will use a default key which is insecure for production.');
      }
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    });
} else {
  console.warn('Warning: MONGODB_URI not set. Starting server without DB connection (some routes will fail).');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (no DB)`);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the full error for server-side diagnostics
  console.error('Unhandled error:', err);

  // Handle some common Mongo/Mongoose errors with friendlier messages
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.errors });
  }

  if (err.code && err.code === 11000) { // duplicate key
    const dupField = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: 'Duplicate key error', field: dupField, value: err.keyValue });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id or type provided', details: err.message });
  }

  // Fallback generic 500 response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    // include stack in development for easier debugging
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});
