// FILE: src/services/messageService.js
// Purpose: Provides a dedicated service for API interactions related to messages
//          within a conversation.

import api from './api';
import { normalizeMessage } from '../utils/normalize';

/**
 * Fetches all messages for a specific conversation.
 * @param {number | string} conversationId - The ID of the conversation to fetch messages for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized message objects.
 */
export const fetchMessages = async (conversationId) => {
  const res = await api.get(`/messages/${conversationId}`);
  // Normalize each message in the response array to ensure a consistent data structure.
  return res.data.map(normalizeMessage);
};

/**
 * Sends a new message from the user to a specific conversation.
 * @param {number | string} conversationId - The ID of the conversation to send the message to.
 * @param {string} text - The content of the message.
 * @returns {Promise<object>} A promise that resolves to the newly created, normalized message object.
 */
export const sendMessage = async (conversationId, text) => {
  const res = await api.post(`/messages/${conversationId}`, {
    content: text,
  });
  return normalizeMessage(res.data);
};
