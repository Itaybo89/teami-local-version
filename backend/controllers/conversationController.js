// File: backend/controllers/conversationController.js
// Description: Handles API requests related to conversations (fetching and starting conversations)

const tryCatch = require('../utils/tryCatch');
const { normalizeConversation } = require('../utils/normalize');
const conversationService = require('../services/conversationService');

/**
 * GET /api/conversations/:projectId
 * Retrieves all conversations for a given project belonging to the authenticated user.
 */
const getConversationsByProject = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = req.params.projectId;

  const conversations = await conversationService.getConversationsByProject(projectId, userId);
  return conversations.map(normalizeConversation);
});

/**
 * POST /api/conversations/:projectId
 * Starts a new conversation under a project.
 * Requires: receiverId and optional title in the request body.
 */
const startConversation = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = req.params.projectId;
  const { receiverId, title } = req.body;

  const conversation = await conversationService.createConversation({
    userId,
    projectId,
    receiverId,
    title,
  });

  return normalizeConversation(conversation);
});

module.exports = {
  getConversationsByProject,
  startConversation,
};
