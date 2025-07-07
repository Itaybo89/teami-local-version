// File: backend/routes/conversationRoutes.js
// Description: Route definitions for project conversations (fetching and starting conversations).

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const conversationController = require('../controllers/conversationController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Schema for starting a new conversation
const StartConversationSchema = z.object({
  receiverId: z.string().min(2),
  title: z.string().optional(),
});

// Routes
router.get('/:projectId', authenticate, conversationController.getConversationsByProject); // List conversations
router.post(
  '/:projectId',
  authenticate,
  validateInput(StartConversationSchema),
  conversationController.startConversation // Start a new conversation
);

module.exports = router;
