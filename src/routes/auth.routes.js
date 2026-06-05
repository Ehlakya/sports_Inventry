const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { registerSchema, loginSchema, refreshSchema } = require('../validations/auth.validation');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);

// Protected routes
router.post('/logout', authenticateJWT, authController.logout);

module.exports = router;
