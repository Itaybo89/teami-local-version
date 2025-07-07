// File: backend/routes/messageRoutes.js
// Description: Routes for retrieving and sending messages within a conversation.

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Schema for sending a message
const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  type: z.string().optional(), // Optional: 'user', 'system', 'error'
});

// Routes
router.get('/:conversationId', authenticate, messageController.getMessagesByConversation); // List messages
router.post(
  '/:conversationId',
  authenticate,
  validateInput(SendMessageSchema),
  messageController.sendMessage // Send a new message
);

module.exports = router;
