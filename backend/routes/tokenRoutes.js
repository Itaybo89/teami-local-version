// File: backend/routes/tokenRoutes.js
// Description: Routes for managing API tokens — list, create, delete, enable/disable.

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const tokenController = require('../controllers/tokenController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Validation schema for adding a new token
const AddTokenSchema = z.object({
  name: z.string().min(2, 'Token name is required'),
  apiKey: z.string().min(10, 'API key is required'),
});

// Routes
router.get('/', authenticate, tokenController.getTokens); // List all user tokens
router.post('/', authenticate, validateInput(AddTokenSchema), tokenController.addToken); // Add a new token
router.delete('/:id', authenticate, tokenController.deleteToken); // Delete a token

router.patch('/:id/disable', authenticate, tokenController.disableToken); // Disable a token
router.patch('/:id/enable', authenticate, tokenController.enableToken);   // Enable a token

module.exports = router;
