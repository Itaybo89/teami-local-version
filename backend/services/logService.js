// File: backend/services/logService.js
// Description: Handles database operations for system and project logs.

const db = require('../config/db');

/**
 * Retrieves all logs for a specific project owned by the user.
 */
const getLogsByProject = async (projectId, userId) => {
  const query = `
    SELECT l.id, l.project_id, l.level, l.message, l.code, l.created_at
    FROM logs l
    JOIN projects p ON l.project_id = p.id
    WHERE l.project_id = $1 AND p.user_id = $2
    ORDER BY l.created_at DESC;
  `;
  return await db.any(query, [projectId, userId]);
};

/**
 * Deletes all logs for a given project, scoped to the authenticated user.
 */
const deleteLogsByProject = async (projectId, userId) => {
  const query = `
    DELETE FROM logs
    WHERE project_id = $1 AND project_id IN (
      SELECT id FROM projects WHERE id = $1 AND user_id = $2
    );
  `;
  return await db.none(query, [projectId, userId]);
};

/**
 * Inserts a new log entry (used by internal brain services).
 */
const insertLog = async ({ projectId, message, level = 'error', code = null }) => {
  const query = `
    INSERT INTO logs (project_id, message, level, code)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;
  return await db.one(query, [projectId, message, level, code]);
};

module.exports = {
  getLogsByProject,
  deleteLogsByProject,
  insertLog,
};
