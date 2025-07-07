const db = require('../config/db');
const { broadcastToProject } = require('./webSocketService');
const projectService = require('./projectService');

/**
 * Assigns a new token to a project after verifying both belong to the same user.
 * Replaces any existing token assignment.
 */
const switchProjectToken = async (projectId, tokenId, userId) => {
  return await db.tx(async (t) => {
    // Verify project ownership
    const project = await t.oneOrNone(
      `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    );
    if (!project) throw 'project.notFound';

    // Verify token ownership
    const token = await t.oneOrNone(
      `SELECT id FROM tokens WHERE id = $1 AND user_id = $2`,
      [tokenId, userId]
    );
    if (!token) throw 'token.notFound';

    // Remove existing assignment (if any)
    await t.none(`DELETE FROM project_tokens WHERE project_id = $1`, [projectId]);

    // Insert new assignment
    await t.none(
      `INSERT INTO project_tokens (project_id, token_id) VALUES ($1, $2)`,
      [projectId, tokenId]
    );

    return true;
  });
};

/**
 * Updates a project's message limit and broadcasts the change to all clients.
 */
const setMessageLimit = async (projectId, limit, userId) => {
  const query = `
    UPDATE projects
    SET message_limit = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id;
  `;
  const result = await db.oneOrNone(query, [limit, projectId, userId]);

  if (result) {
    broadcastToProject(Number(projectId), {
      type: 'project_updated',
      payload: {
        projectId: Number(projectId),
        messageLimit: limit
      }
    });
    return true;
  }

  return false;
};

/**
 * Decrements a project's message limit by 1.
 * If the limit reaches 0, pauses the project automatically and notifies clients.
 */
const decrementMessageLimit = async (projectId) => {
  const query = `
    UPDATE projects
    SET message_limit = message_limit - 1
    WHERE id = $1
    RETURNING message_limit;
  `;
  const result = await db.oneOrNone(query, [projectId]);

  if (!result) return { success: false, newLimit: null };

  const newLimit = result.message_limit;

  broadcastToProject(Number(projectId), {
    type: 'project_updated',
    payload: {
      projectId: Number(projectId),
      messageLimit: newLimit,
      isPaused: newLimit <= 0 ? true : undefined,
    },
  });

  if (newLimit <= 0) {
    await projectService.pauseProjectInternal(
      projectId,
      'MESSAGE_LIMIT',
      'Project paused automatically after reaching message limit.'
    );
  }

  return { success: true, newLimit };
};

module.exports = {
  switchProjectToken,
  setMessageLimit,
  decrementMessageLimit
};
