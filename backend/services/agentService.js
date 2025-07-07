// File: backend/services/agentService.js
// Description: Provides database operations for user-defined agents.

const db = require('../config/db');

/**
 * Retrieves all agents created by a specific user.
 */
const getAgentsByUser = async (userId) => {
  const query = `
    SELECT id, name, description, model, role, created_at
    FROM agents
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  return await db.any(query, [userId]);
};

/**
 * Creates a new agent with the provided details.
 */
const createAgent = async ({ userId, name, description, model, role }) => {
  const query = `
    INSERT INTO agents (user_id, name, description, model, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, description, model, role, created_at;
  `;
  return await db.one(query, [userId, name, description, model, role]);
};

/**
 * Deletes an agent belonging to a user (currently not used).
 */
// const deleteAgent = async (agentId, userId) => {
//   const query = `
//     DELETE FROM agents
//     WHERE id = $1 AND user_id = $2
//     RETURNING id;
//   `;
//   const result = await db.oneOrNone(query, [agentId, userId]);
//   return !!result;
// };

module.exports = {
  getAgentsByUser,
  createAgent,
  // deleteAgent,
};
