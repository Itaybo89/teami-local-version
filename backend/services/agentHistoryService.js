// File: backend/services/agentHistoryService.js
// Description: Manages agent memory summaries and message counts per project.

const db = require('../config/db');

/**
 * Saves or updates a memory summary for a specific agent in a project.
 * Resets message count and increments summary count on each update.
 */
const saveSummary = async ({ projectId, agentId, summary, historyJson = null }) => {
  if (!projectId || !agentId || !summary) {
    throw new Error("Missing required summary fields");
  }

  const query = `
    INSERT INTO agent_history_summaries (
      project_id, agent_id, summary, history_json, message_count, summary_count, updated_at
    )
    VALUES (
      $1, $2, $3, $4, 0,
      COALESCE(
        (SELECT summary_count FROM agent_history_summaries WHERE project_id = $1 AND agent_id = $2),
        0
      ) + 1,
      NOW()
    )
    ON CONFLICT (project_id, agent_id)
    DO UPDATE SET
      summary = EXCLUDED.summary,
      history_json = EXCLUDED.history_json,
      message_count = 0,
      summary_count = agent_history_summaries.summary_count + 1,
      updated_at = NOW()
    RETURNING id;
  `;

  return await db.one(query, [projectId, agentId, summary, historyJson]);
};

/**
 * Increments the message count for a given agent in a project.
 */
const incrementMessageCount = async (projectId, agentId) => {
  const query = `
    INSERT INTO agent_history_summaries 
      (project_id, agent_id, summary, message_count)
    VALUES 
      ($1, $2, '', 1)
    ON CONFLICT (project_id, agent_id)
    DO UPDATE SET
      message_count = agent_history_summaries.message_count + 1
    RETURNING message_count;
  `;
  return await db.one(query, [projectId, agentId]);
};

/**
 * Retrieves the latest summaries for all agents in a given project.
 */
const getLatestSummaries = async (projectId) => {
  const query = `
    SELECT agent_id, summary, message_count, summary_count
    FROM agent_history_summaries
    WHERE project_id = $1;
  `;
  return await db.any(query, [projectId]);
};

/**
 * Retrieves the summary for a specific agent in a project, if it exists.
 */
const getSummary = async (projectId, agentId) => {
  const query = `
    SELECT summary, history_json, message_count, summary_count, updated_at
    FROM agent_history_summaries
    WHERE project_id = $1 AND agent_id = $2;
  `;
  return await db.oneOrNone(query, [projectId, agentId]);
};

module.exports = {
  saveSummary,
  incrementMessageCount,
  getLatestSummaries,
  getSummary,
};
