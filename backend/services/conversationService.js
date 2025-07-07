// File: backend/services/conversationService.js
// Description: Handles database operations related to conversations within projects.

const db = require('../config/db');

/**
 * Retrieves all conversations for a given project, ensuring ownership by the user.
 */
const getConversationsByProject = async (projectId, userId) => {
  const query = `
    SELECT c.id, c.project_id, c.sender_id, c.receiver_id, c.created_at
    FROM conversations c
    JOIN projects p ON c.project_id = p.id
    WHERE c.project_id = $1 AND p.user_id = $2
    ORDER BY c.created_at DESC;
  `;
  return await db.any(query, [projectId, userId]);
};

/**
 * Creates a new conversation within a project.
 * The sender is always the authenticated user.
 */
const createConversation = async ({ userId, projectId, receiverId }) => {
  const query = `
    INSERT INTO conversations (project_id, sender_id, receiver_id)
    VALUES ($1, $2, $3)
    RETURNING id, project_id, sender_id, receiver_id, created_at;
  `;
  return await db.one(query, [projectId, userId, receiverId]);
};

/**
 * Internal-only: Returns all conversations in a project without user check.
 */
const getConversationsByProjectInternal = async (projectId) => {
  const query = `
    SELECT id, project_id, sender_id, receiver_id, created_at
    FROM conversations
    WHERE project_id = $1;
  `;
  return await db.any(query, [projectId]);
};

module.exports = {
  getConversationsByProject,
  createConversation,
  getConversationsByProjectInternal,
};
