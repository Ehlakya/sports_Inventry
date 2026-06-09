const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All inventory routes require ADMIN privileges
router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.get('/', inventoryController.getTransactionHistory);
router.get('/transactions', inventoryController.getTransactionHistory);
router.get('/sales-summary', inventoryController.getSalesSummary);

module.exports = router;
