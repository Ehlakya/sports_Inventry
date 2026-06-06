const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { createProductSchema, updateProductSchema, updateSizesSchema } = require('../validations/product.validation');
const { authenticateJWT, authorizeRoles, authenticateOptional } = require('../middleware/auth.middleware');

// Public read routes — optional authentication for role-based pricing
router.get('/sizes', authenticateOptional, productController.getAllUniqueSizes);
router.get('/', authenticateOptional, productController.getProducts);
router.get('/:id', authenticateOptional, productController.getProductById);

// Protected routes below require authentication
router.use(authenticateJWT);

// View Product Sizes (Supplier and Admin only)
router.get('/:id/sizes', authorizeRoles('ADMIN', 'SUPPLIER'), productController.getProductSizes);

// Product Write Operations (ADMIN only)
router.post('/', authorizeRoles('ADMIN'), validateBody(createProductSchema), productController.createProduct);
router.put('/:id', authorizeRoles('ADMIN'), validateBody(updateProductSchema), productController.updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), productController.deleteProduct);

// Size Stock Update Operations (ADMIN only)
router.put('/:id/sizes', authorizeRoles('ADMIN'), validateBody(updateSizesSchema), productController.updateProductSizes);

module.exports = router;
