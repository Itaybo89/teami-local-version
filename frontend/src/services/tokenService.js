// FILE: src/services/tokenService.js
// Purpose: Provides a dedicated service for all API interactions related to user API tokens.
// This includes fetching, adding, deleting, and changing the status of tokens.

import api from './api';
import { normalizeToken } from '../utils/normalize';

/**
 * Fetches all API tokens for the currently authenticated user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized token objects.
 */
export const fetchTokens = async () => {
  const res = await api.get('/tokens');
  // Normalize each token in the response array to ensure a consistent data structure.
  return res.data.map(normalizeToken);
};

/**
 * Fetches all available tokens that can be assigned to a specific project.
 * @param {number} projectId - The ID of the project.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized token objects.
 */
export const fetchTokensForProject = async (projectId) => {
  const res = await api.get(`/tokens/project/${projectId}`);
  return res.data.map(normalizeToken);
};

/**
 * Adds a new API token for the user.
 * @param {object} token - The token data to be submitted (e.g., { name, apiKey }).
 * @returns {Promise<object>} A promise that resolves to the newly created, normalized token object.
 */
export const addToken = async (token) => {
  const res = await api.post('/tokens', token);
  return normalizeToken(res.data);
};

/**
 * Deletes a specific token by its ID.
 * @param {number} tokenId - The ID of the token to delete.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const deleteToken = async (tokenId) => {
  const res = await api.delete(`/tokens/${tokenId}`);
  return res.data;
};

/**
 * Disables a specific token, making it inactive without deleting it.
 * @param {number} tokenId - The ID of the token to disable.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const disableToken = async (tokenId) => {
  const res = await api.patch(`/tokens/${tokenId}/disable`);
  return res.data;
};

/**
 * Enables a specific token, making it active.
 * @param {number} tokenId - The ID of the token to enable.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const enableToken = async (tokenId) => {
  const res = await api.patch(`/tokens/${tokenId}/enable`);
  return res.data;
};
