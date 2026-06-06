const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All user/supplier management routes require authentication and ADMIN role
router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/suppliers', userController.getSuppliers);
router.post('/suppliers', userController.createSupplier);
router.put('/suppliers/:id', userController.updateSupplier);
router.delete('/suppliers/:id', userController.deleteSupplier);

// Customer management routes
router.get('/customers', userController.getCustomers);
router.get('/customers/:id', userController.getCustomerDetails);

module.exports = router;
