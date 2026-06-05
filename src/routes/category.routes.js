const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { categorySchema } = require('../validations/category.validation');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// All category routes require authentication
router.use(authenticateJWT);

// Publicly read categories (for customers/suppliers/admins)
router.get('/', categoryController.getCategories);

// Modify categories (ADMIN only)
router.post('/', authorizeRoles('ADMIN'), validateBody(categorySchema), categoryController.createCategory);
router.put('/:id', authorizeRoles('ADMIN'), validateBody(categorySchema), categoryController.updateCategory);
router.delete('/:id', authorizeRoles('ADMIN'), categoryController.deleteCategory);

module.exports = router;
