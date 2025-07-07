// File: backend/controllers/messageController.js
// Description: Handles API requests related to conversation messages (fetch and send)

const tryCatch = require('../utils/tryCatch');
const { normalizeMessage } = require('../utils/normalize');
const messageService = require('../services/messageService');
const { MESSAGE_TYPES } = require('../config/constants');

/**
 * GET /api/messages/:conversationId
 * Retrieves all messages in a conversation, ensuring user has access.
 */
const getMessagesByConversation = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const conversationId = req.params.conversationId;

  const messages = await messageService.getMessagesByConversation(conversationId, userId);
  return messages.map(normalizeMessage);
});

/**
 * POST /api/messages/:conversationId
 * Sends a new message into a conversation.
 * System is always the sender (senderId = 0).
 * Automatically resolves correct receiver from conversation participants.
 */
const sendMessage = (req, res) => tryCatch(res, async () => {
  const conversationId = req.params.conversationId;
  const senderId = 0; // System is always the sender
  const { content, type = MESSAGE_TYPES.USER } = req.body;

  // Retrieve sender/receiver/project metadata for the conversation
  const { sender_id, receiver_id, project_id } = await messageService.getConversationParticipants(conversationId);

  // Determine receiver: the non-system participant
  const receiverId = sender_id === 0 ? receiver_id : sender_id;

  const message = await messageService.createMessage({
    conversationId,
    projectId: project_id,
    senderId,
    receiverId,
    content,
    type,
  });

  return normalizeMessage(message);
});

module.exports = {
  getMessagesByConversation,
  sendMessage,
};
