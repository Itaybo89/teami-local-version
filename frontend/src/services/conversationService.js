// FILE: src/services/conversationService.js
// Purpose: Provides a dedicated service for API interactions related to
//          conversations within a project.

import api from './api';
import { normalizeConversation } from '../utils/normalize';

/**
 * Fetches all conversations associated with a specific project.
 * @param {number | string} projectId - The ID of the project to fetch conversations for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized conversation objects.
 */
export const fetchConversations = async (projectId) => {
  const res = await api.get(`/conversations/${projectId}`);
  // Normalize each conversation in the response array to ensure a consistent data structure.
  return res.data.map(normalizeConversation);
};

/**
 * Creates a new conversation within a project with a specific agent.
 * @param {number | string} projectId - The ID of the project where the conversation will be created.
 * @param {number} receiverId - The ID of the agent who is the other participant in the conversation.
 * @param {string} title - A user-provided title for the conversation.
 * @returns {Promise<object>} A promise that resolves to the newly created, normalized conversation object.
 */
export const createConversation = async (projectId, receiverId, title) => {
  const res = await api.post(`/conversations/${projectId}`, { receiverId, title });
  return normalizeConversation(res.data);
};
