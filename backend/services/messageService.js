// File: backend/services/messageService.js
// Description: Handles all message-related database operations, including creation, querying, and status updates.

const db = require('../config/db');
const { MESSAGE_TYPES } = require('../config/constants');
const { nudgeBrain } = require('./brainService');
const { broadcastToProject } = require('./webSocketService');
const { normalizeMessage } = require('../utils/normalize');


// ──────────────── User-Facing Functions ────────────────

/**
 * Retrieves all messages for a conversation, ensuring project ownership.
 */
const getMessagesByConversation = async (conversationId, userId) => {
  const query = `
    SELECT m.*
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN projects p ON c.project_id = p.id
    WHERE m.conversation_id = $1 AND p.user_id = $2
    ORDER BY m.created_at ASC;
  `;
  return await db.any(query, [conversationId, userId]);
};

/**
 * Retrieves the participants and project ID for a conversation.
 */
const getConversationParticipants = async (conversationId) => {
  const query = `
    SELECT sender_id, receiver_id, project_id
    FROM conversations
    WHERE id = $1
  `;
  return await db.oneOrNone(query, [conversationId]);
};


// ──────────────── Core: Create Message ────────────────

/**
 * Inserts a new message and broadcasts it.
 * If the message is from a USER, it triggers the brain via nudgeBrain().
 */
const createMessage = async (data) => {
  const conversationId = data.conversationId ?? data.conversation_id;
  const projectId = data.projectId ?? data.project_id;
  const senderId = typeof data.senderId === 'number' ? data.senderId : data.sender_id;
  const receiverId = data.receiverId ?? data.receiver_id;
  const content = data.content;
  const type = data.type;

  if (typeof senderId !== 'number' || typeof receiverId !== 'number' || !projectId || !conversationId) {
    throw new Error("Message creation failed: Missing required ID fields.");
  }

  return await db.tx(async t => {
    const status = data.status || ((type === MESSAGE_TYPES.USER || type === 'user') ? 'pending' : 'sent');

    const insertQuery = `
      INSERT INTO messages (conversation_id, project_id, sender_id, receiver_id, content, type, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const newMessage = await t.one(insertQuery, [
      conversationId, projectId, senderId, receiverId, content, type, status
    ]);

    await t.none('UPDATE projects SET last_activity_at = NOW() WHERE id = $1', [projectId]);

    const normalizedNewMessage = normalizeMessage(newMessage);
    broadcastToProject(newMessage.project_id, { type: 'new_message', payload: normalizedNewMessage });

    // Only trigger the brain if the message is user-created
    if (newMessage.status === 'pending' && (newMessage.type === MESSAGE_TYPES.USER || newMessage.type === 'user')) {
      console.log(`✅ User message created. Nudging brain for project ${newMessage.project_id}.`);
      nudgeBrain(newMessage.project_id);
    } else {
      console.log(`✅ Assistant message created. Brain will continue its loop. No nudge sent.`);
    }

    return newMessage;
  });
};


// ──────────────── Internal / Brain Functions ────────────────

/**
 * Returns all pending messages for a given project.
 */
const getPendingMessages = async (projectId) => {
  const query = `
    SELECT * FROM messages
    WHERE project_id = $1 AND status = 'pending'
    ORDER BY created_at ASC;
  `;
  return await db.any(query, [projectId]);
};

/**
 * Updates the status of a message (e.g., 'sent', 'failed') and broadcasts the update.
 */
const updateMessageStatus = async (messageId, status) => {
  const query = `
    UPDATE messages 
    SET status = $1 
    WHERE id = $2 
    RETURNING id, status, project_id, conversation_id;
  `;
  const updatedMessage = await db.oneOrNone(query, [status, messageId]);

  if (updatedMessage) {
    console.log(`📢 Broadcasting status update for message ${updatedMessage.id}`);
    broadcastToProject(updatedMessage.project_id, {
      type: 'message_updated',
      payload: {
        id: updatedMessage.id,
        status: updatedMessage.status,
        conversationId: updatedMessage.conversation_id,
      }
    });
  }

  return updatedMessage;
};

/**
 * Retrieves recent messages for a specific agent in a project.
 */
const getAgentRecentMessages = async (projectId, agentId, limit = 10) => {
  const query = `
    SELECT *
    FROM messages
    WHERE project_id = $1 AND status = 'sent' AND type IN ('user', 'assistant')
      AND ($2::integer IS NULL OR sender_id = $2 OR receiver_id = $2)
    ORDER BY created_at DESC LIMIT $3;
  `;
  return await db.any(query, [projectId, agentId, limit]);
};

/**
 * Returns the timestamp of the oldest pending message in a project (used by the watchdog).
 */
const getOldestPendingMessageTimestamp = async (projectId) => {
  const query = `
    SELECT created_at as timestamp FROM messages
    WHERE project_id = $1 AND status = 'pending'
    ORDER BY created_at ASC
    LIMIT 1;
  `;
  return await db.oneOrNone(query, [projectId]);
};


module.exports = {
  getMessagesByConversation,
  createMessage,
  getConversationParticipants,
  getPendingMessages,
  updateMessageStatus,
  getAgentRecentMessages,
  getOldestPendingMessageTimestamp,
};
