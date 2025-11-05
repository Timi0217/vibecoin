/**
 * VibeCoin Backend Server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const earningsRoutes = require('./routes/earnings');
const payoutRoutes = require('./routes/payouts');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Create Express app
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/payouts', payoutRoutes);

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'VibeCoin API',
    version: '1.0.0',
    description: 'Backend API for VibeCoin - Earn money while you code',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me'
      },
      tasks: {
        next: 'GET /api/tasks/next',
        submit: 'POST /api/tasks/:id/submit',
        history: 'GET /api/tasks/history'
      },
      earnings: {
        get: 'GET /api/earnings',
        stats: 'GET /api/earnings/stats'
      },
      payouts: {
        request: 'POST /api/payouts/request',
        history: 'GET /api/payouts/history'
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 VibeCoin API server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api\n`);
  });
}

module.exports = app;
