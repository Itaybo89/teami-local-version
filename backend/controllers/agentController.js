// File: backend/controllers/agentController.js
// Description: Handles agent-related API requests (CRUD operations for user agents)

const tryCatch = require('../utils/tryCatch');
const { resSuccess } = require('../utils/responseSender');
const { normalizeAgent } = require('../utils/normalize');
const agentService = require('../services/agentService');

/**
 * GET /api/agents
 * Returns a list of all agents belonging to the authenticated user.
 */
const getAgents = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const agents = await agentService.getAgentsByUser(userId);
  return agents.map(normalizeAgent);
});

/**
 * POST /api/agents
 * Creates a new agent for the authenticated user.
 * Requires: name, description, model, and role in the request body.
 */
const addAgent = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const { name, description, model, role } = req.body;

  const agent = await agentService.createAgent({
    userId,
    name,
    description,
    model,
    role,
  });

  return normalizeAgent(agent);
}, 'agent.addSuccess');

// ❌ DELETE endpoint future scaling
// /**
//  * DELETE /api/agents/:id
//  * Deletes a user's agent by ID.
//  */
// const deleteAgent = (req, res) => tryCatch(res, async () => {
//   const agentId = Number(req.params.id);
//   const userId = req.user.id;

//   const deleted = await agentService.deleteAgent(agentId, userId);
//   if (!deleted) throw 'agent.notFound';

//   return null;
// }, 'agent.deleteSuccess');

module.exports = {
  getAgents,
  addAgent,
  // deleteAgent,
};
