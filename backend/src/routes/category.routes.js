const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { categorySchema } = require('../validations/category.validation');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');

// Public read route — no authentication required
router.get('/', categoryController.getCategories);

// Protected routes require authentication
router.use(authenticateJWT);

// Modify categories (ADMIN only)
router.post('/', authorizeRoles('ADMIN'), validateBody(categorySchema), categoryController.createCategory);
router.put('/:id', authorizeRoles('ADMIN'), validateBody(categorySchema), categoryController.updateCategory);
router.delete('/:id', authorizeRoles('ADMIN'), categoryController.deleteCategory);

module.exports = router;
