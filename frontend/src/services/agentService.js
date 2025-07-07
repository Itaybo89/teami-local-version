// FILE: src/services/agentService.js
// Purpose: Provides a dedicated service for all API interactions related to
//          the user's collection of AI agents.

import api from './api';
import { normalizeAgent } from '../utils/normalize';

/**
 * Fetches all agents created by the currently authenticated user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized agent objects.
 */
export const fetchAgents = async () => {
  const res = await api.get('/agents');
  // Normalize each agent in the response array to ensure a consistent data structure for the UI.
  return res.data.map(normalizeAgent);
};

/**
 * Creates a new agent profile for the user.
 * @param {object} agent - The agent data to be submitted (e.g., { name, role, description, model }).
 * @returns {Promise<object>} A promise that resolves to the newly created, normalized agent object.
 */
export const addAgent = async (agent) => {
  const res = await api.post('/agents', agent);
  return normalizeAgent(res.data);
};

/**
 * Deletes a specific agent by its ID.
 * @param {number | string} agentId - The ID of the agent to delete.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const deleteAgent = async (agentId) => {
  const res = await api.delete(`/agents/${agentId}`);
  return res.data;
};
