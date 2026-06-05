const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { createProductSchema, updateProductSchema, updateSizesSchema } = require('../validations/product.validation');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// Public read routes — no authentication required for catalog browsing
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

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
