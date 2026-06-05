const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded forms
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'Sports Inventory Management System API'
  });
});

// Register api v1 routes
app.use('/api/v1', apiRoutes);

// Fallback for Page/Route Not Found
app.use((req, res, next) => {
  res.status(404).json({ error: `API endpoint '${req.originalUrl}' not found.` });
});

// Register global error handler middleware (must be after all other routes)
app.use(errorHandler);

module.exports = app;
