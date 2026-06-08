const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const invoiceController = require('../controllers/invoice.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { placeOrderSchema, cartSummarySchema } = require('../validations/order.validation');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All order routes require authentication
router.use(authenticateJWT);

// View order history or details (any role)
router.get('/', orderController.getOrderHistory);
router.get('/:id', orderController.getOrderById);

// Download Invoice for Order
router.get('/:id/invoice', invoiceController.downloadInvoice);

// Place orders (restricted to CUSTOMER or SUPPLIER roles)
router.post('/', authorizeRoles('CUSTOMER', 'SUPPLIER'), validateBody(placeOrderSchema), orderController.createOrder);

// Calculate stateless cart summary (restricted to CUSTOMER or SUPPLIER roles)
router.post('/cart-summary', authorizeRoles('CUSTOMER', 'SUPPLIER'), validateBody(cartSummarySchema), orderController.getCartSummary);

// Update order status (ADMIN only)
router.put('/:id/status', authorizeRoles('ADMIN'), orderController.updateOrderStatus);

module.exports = router;
