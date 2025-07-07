// File: backend/routes/authRoutes.js
// Description: Route definitions for authentication (register, login, logout, and current user info).

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const authController = require('../controllers/authController');
const validateInput = require('../middleware/validateInput');
const authenticate = require('../middleware/authenticate');

// Validation schemas
const RegisterSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Routes
router.get('/me', authenticate, authController.me); // Get current user info
router.post('/register', validateInput(RegisterSchema), authController.register); // Register a new user
router.post('/login', validateInput(LoginSchema), authController.login); // Login
router.post('/logout', authController.logout); // Logout

module.exports = router;
