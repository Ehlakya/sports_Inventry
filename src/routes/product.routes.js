const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { createProductSchema, updateProductSchema, updateSizesSchema } = require('../validations/product.validation');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All product routes require token authentication
router.use(authenticateJWT);

// Catalog Browsing & Detail fetching (accessible to ADMIN, SUPPLIER, CUSTOMER)
// Enforces pricing filters automatically in controller
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// View Product Sizes (Supplier and Admin only)
router.get('/:id/sizes', authorizeRoles('ADMIN', 'SUPPLIER'), productController.getProductSizes);

// Product Write Operations (ADMIN only)
router.post('/', authorizeRoles('ADMIN'), validateBody(createProductSchema), productController.createProduct);
router.put('/:id', authorizeRoles('ADMIN'), validateBody(updateProductSchema), productController.updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), productController.deleteProduct);

// Size Stock Update Operations (ADMIN only)
router.put('/:id/sizes', authorizeRoles('ADMIN'), validateBody(updateSizesSchema), productController.updateProductSizes);

module.exports = router;
