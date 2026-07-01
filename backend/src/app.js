const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const path = require('path');

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse incoming URL-encoded forms
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public/uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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

// Root route to prevent 404 on base URL
app.get('/', (req, res) => {
  res.status(200).send('Sports Inventory Management System API is running successfully.');
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
