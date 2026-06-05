const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Fetch dashboard (ADMIN, SUPPLIER, CUSTOMER)
router.get('/', authenticateJWT, dashboardController.getDashboard);

module.exports = router;
