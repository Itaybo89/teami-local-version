// FILE: backend/services/projectService.js
// Description: Manages all project-related operations including retrieval, creation, deletion, updates, and internal brain access.

const db = require('../config/db');
const { nudgeBrain } = require('./brainService');
const { broadcastToProject } = require('./webSocketService');



// ──────────────── Public Project Queries ────────────────

/**
 * Gets all basic project data for a user.
 */
const getProjectsByUser = async (userId) => {
  const query = `
    SELECT id, title, description, system_prompt, created_at, paused, message_limit, last_activity_at
    FROM projects
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;
  return await db.any(query, [userId]);
};

/**
 * Gets all projects for a user along with associated agent metadata.
 */
const getProjectsByUserWithAgents = async (userId) => {
  const query = `
    SELECT 
      p.id AS project_id, p.title, p.description, p.system_prompt, p.paused,
      p.message_limit, p.created_at, p.last_activity_at,
      a.id AS agent_id, a.name AS agent_name, a.description AS agent_description,
      a.model AS agent_model, pam.role AS agent_role, pam.thread_id AS agent_thread_id
    FROM projects p
    LEFT JOIN project_agent_members pam ON pam.project_id = p.id
    LEFT JOIN agents a ON a.id = pam.agent_id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC;
  `;

  const rows = await db.any(query, [userId]);
  const projectsMap = new Map();

  for (const row of rows) {
    const pid = row.project_id;
    if (!projectsMap.has(pid)) {
      projectsMap.set(pid, {
        id: pid,
        title: row.title,
        description: row.description,
        systemPrompt: row.system_prompt || '',
        isPaused: row.paused || false,
        messageLimit: row.message_limit || null,
        createdAt: row.created_at,
        lastActivityAt: row.last_activity_at,
        agents: []
      });
    }

    if (row.agent_id) {
      projectsMap.get(pid).agents.push({
        id: row.agent_id,
        name: row.agent_name,
        description: row.agent_description,
        model: row.agent_model,
        role: row.agent_role || '—',
        threadId: row.agent_thread_id || null
      });
    }
  }

  return Array.from(projectsMap.values());
};

/**
 * Gets full project metadata for a single project with agent and token info.
 */
const getProjectById = async (projectId, userId) => {
  const query = `
    SELECT 
      p.id AS project_id, p.title, p.description, p.system_prompt, p.paused,
      p.message_limit, p.created_at, p.last_activity_at,
      a.id AS agent_id, a.name AS agent_name, a.description AS agent_description,
      a.model AS agent_model, pam.role AS agent_role, pam.prompt AS agent_prompt,
      pam.can_message_ids AS agent_can_message_ids, pam.thread_id AS agent_thread_id
    FROM projects p
    LEFT JOIN project_agent_members pam ON pam.project_id = p.id
    LEFT JOIN agents a ON a.id = pam.agent_id
    WHERE p.id = $1 AND p.user_id = $2;
  `;

  const rows = await db.any(query, [projectId, userId]);
  if (rows.length === 0) return null;

  const base = rows[0];
  const project = {
    id: base.project_id,
    title: base.title,
    description: base.description,
    systemPrompt: base.system_prompt,
    isPaused: base.paused,
    messageLimit: base.message_limit,
    createdAt: base.created_at,
    lastActivityAt: base.last_activity_at,
    agents: [],
    tokens: [],
    tokenId: null
  };

  for (const row of rows) {
    if (row.agent_id) {
      project.agents.push({
        id: row.agent_id,
        name: row.agent_name,
        description: row.agent_description,
        model: row.agent_model,
        role: row.agent_role,
        prompt: row.agent_prompt,
        canMessageIds: row.agent_can_message_ids,
        threadId: row.agent_thread_id || null
      });
    }
  }

  const tokenRows = await db.any(`
    SELECT t.id, t.name, t.active, t.user_id,
           pt.assigned_at AS assignedAt,
           t.created_at AS createdAt
    FROM project_tokens pt
    JOIN tokens t ON t.id = pt.token_id
    WHERE pt.project_id = $1;
  `, [project.id]);

  project.tokens = tokenRows;
  project.tokenId = tokenRows[0]?.id || null;

  return project;
};

/**
 * Updates a project's paused status.
 * If resuming, it also updates last_activity_at, nudges the brain,
 * and broadcasts the update.
 */
const updateProjectStatus = async (projectId, userId, paused) => {
  // Use a transaction to ensure all database operations succeed or fail together.
  return await db.tx(async t => {
    let updatedProject;

    if (paused === false) {
      // --- RESUMING a project ---
      // Update status AND last_activity_at
      const resumeQuery = `
        UPDATE projects
        SET paused = false, last_activity_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING id;
      `;
      updatedProject = await t.oneOrNone(resumeQuery, [projectId, userId]);

      if (updatedProject) {
        console.log(`✅ Project ${projectId} resumed. Nudging brain.`);
        nudgeBrain(projectId); // Nudge the brain to check for work.
      }
    } else {
      // --- PAUSING a project ---
      // Only update the paused status.
      const pauseQuery = `
        UPDATE projects
        SET paused = true
        WHERE id = $1 AND user_id = $2
        RETURNING id;
      `;
      updatedProject = await t.oneOrNone(pauseQuery, [projectId, userId]);
    }

    if (updatedProject) {
      // For any status change, broadcast to the frontend.
      console.log(`📢 Broadcasting project_updated for project ${projectId}`);
      broadcastToProject(projectId, { type: 'project_updated', payload: { projectId } });
    }

    return updatedProject;
  });
};


// ──────────────── Creation / Deletion ────────────────

/**
 * Creates a project and all associated agent/member entries.
 */
const createProjectWithMembers = async (
  userId, title, description, systemPrompt,
  agents = [], tokenId = null
) => {
  return await db.tx(async t => {
    const existing = await t.oneOrNone(
      `SELECT id FROM projects WHERE user_id = $1 AND title = $2`,
      [userId, title]
    );
    if (existing) throw new Error('A project with this title already exists.');

    const project = await t.one(`
      INSERT INTO projects (user_id, title, description, system_prompt, paused)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id, title, description, system_prompt, created_at;
    `, [userId, title, description, systemPrompt]);

    if (tokenId) {
      await t.none(`INSERT INTO project_tokens (project_id, token_id) VALUES ($1, $2);`, [project.id, tokenId]);
    }

    const indexToIdMap = {};
    const memberList = [];

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const agentRow = await t.one(`
        INSERT INTO agents (user_id, name, role, description, model)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;`, [userId, a.name, a.role, a.description, a.model]);

      indexToIdMap[i] = agentRow.id;
      memberList.push({
        agentId: agentRow.id,
        role: a.role,
        prompt: a.prompt || a.description || '',
        canMessageIndexes: a.canMessageIds || [],
        threadId: null
      });
    }

    memberList.push({
      agentId: 0,
      role: 'system',
      prompt: 'System agent: logs, system prompts, and control',
      canMessageIndexes: Object.keys(indexToIdMap).map(Number),
      threadId: 'system'
    });

    const createdPairs = new Set();

    for (const member of memberList) {
      const canMessageIds = member.canMessageIndexes
        .map(i => indexToIdMap[i])
        .filter(id => id !== undefined && id !== member.agentId);

      await t.none(`
        INSERT INTO project_agent_members (project_id, agent_id, role, prompt, can_message_ids, thread_id)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [project.id, member.agentId, member.role, member.prompt, canMessageIds.join(','), member.threadId]);

      for (const otherId of canMessageIds) {
        const sid = Math.min(member.agentId, otherId);
        const rid = Math.max(member.agentId, otherId);
        const pairKey = `${sid}-${rid}`;
        if (!createdPairs.has(pairKey)) {
          await t.none(`
            INSERT INTO conversations (project_id, sender_id, receiver_id)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING;
          `, [project.id, sid, rid]);
          createdPairs.add(pairKey);
        }
      }
    }

    return project;
  });
};

/**
 * Deletes a project and cascades to dependent entries, including agent cleanup.
 */
const deleteProject = async (projectId, userId) => {
  return db.tx(async t => {
    const agentMembers = await t.any(
      `SELECT agent_id FROM project_agent_members WHERE project_id = $1 AND agent_id != 0`,
      [projectId]
    );
    const agentIdsToDelete = agentMembers.map(m => m.agent_id);

    const deletedProject = await t.oneOrNone(
      `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
      [projectId, userId]
    );
    if (!deletedProject) throw new Error('Project not found or user not authorized.');

    if (agentIdsToDelete.length > 0) {
      await t.none(
        `DELETE FROM agents WHERE id IN ($1:csv) AND user_id = $2`,
        [agentIdsToDelete, userId]
      );
    }

    return true;
  });
};


// ──────────────── Internal Use (Brain/Watchdog) ────────────────

/**
 * [BRAIN] Gets a project with agents and token for internal processing.
 */
const getProjectByIdInternal = async (projectId) => {
  const query = `
    SELECT p.id AS project_id, p.title, p.description, p.system_prompt, p.paused,
           p.message_limit, p.created_at, p.last_activity_at,
           a.id AS agent_id, a.name AS agent_name, a.description AS agent_description,
           a.model AS agent_model, pam.role AS agent_role, pam.prompt AS agent_prompt,
           pam.can_message_ids AS agent_can_message_ids,
           t.api_key
    FROM projects p
    LEFT JOIN project_agent_members pam ON pam.project_id = p.id
    LEFT JOIN agents a ON a.id = pam.agent_id
    LEFT JOIN project_tokens pt ON pt.project_id = p.id
    LEFT JOIN tokens t ON t.id = pt.token_id
    WHERE p.id = $1;
  `;
  const rows = await db.any(query, [projectId]);
  if (rows.length === 0) return null;

  return {
    id: rows[0].project_id,
    title: rows[0].title,
    description: rows[0].description,
    systemPrompt: rows[0].system_prompt,
    isPaused: rows[0].paused,
    messageLimit: rows[0].message_limit,
    apiKey: rows[0].api_key,
    agents: rows.filter(r => r.agent_id).map(r => ({
      id: r.agent_id,
      name: r.agent_name,
      description: r.agent_description,
      model: r.agent_model,
      role: r.agent_role,
      prompt: r.agent_prompt,
    }))
  };
};

/**
 * [BRAIN] Gets the paused and message limit status of a project.
 */
const getProjectFlags = async (projectId) => {
  const query = `
    SELECT 
      p.paused, 
      p.message_limit,
      COALESCE(t.active, false) AS is_token_active
    FROM projects p
    LEFT JOIN project_tokens pt ON pt.project_id = p.id
    LEFT JOIN tokens t ON t.id = pt.token_id
    WHERE p.id = $1;
  `;
  return await db.oneOrNone(query, [projectId]);
};

/**
 * [WATCHDOG/BRAIN] Gets all currently active projects.
 */
const getActiveProjects = async () => {
  const query = "SELECT id, last_activity_at FROM projects WHERE paused = false";
  return await db.any(query);
};

/**
 * Pauses a project from an internal source (like the watchdog) and broadcasts the change.
 * @param {number} projectId - The ID of the project to pause.
 * @param {string} code - A machine-readable code for the pause reason.
 * @param {string} message - A human-readable message for logging.
 */
const pauseProjectInternal = async (projectId, code, message) => {
  // Use a transaction for database operations.
  return db.tx(async t => {
    // Pause the project in the database.
    await t.none(`UPDATE projects SET paused = true WHERE id = $1`, [projectId]);

    // Log the reason for the pause.
    await t.none(`
      INSERT INTO logs (project_id, message, level, code)
      VALUES ($1, $2, 'warn', $3);
    `, [projectId, message, code]);
    
    // Notify the frontend via WebSocket that the project state has changed.
    broadcastToProject(projectId, { type: 'project_updated', payload: { projectId } });
  });
};


module.exports = {
  getProjectsByUser,
  getProjectsByUserWithAgents,
  getProjectById,
  createProjectWithMembers,
  deleteProject,
  updateProjectStatus,
  getProjectByIdInternal,
  getProjectFlags,
  getActiveProjects,
  pauseProjectInternal
};
