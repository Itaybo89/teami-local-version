// FILE: src/services/settingsService.js
// Purpose: Provides a dedicated service for all API interactions related to
//          modifying project-level settings.

import api from './api';

/**
 * Sends a request to the backend to pause or unpause a project.
 * @param {number} projectId - The ID of the project to update.
 * @param {boolean} paused - The new paused state (true to pause, false to unpause).
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const pauseProject = async (projectId, paused) => {
  const res = await api.patch(`/settings/project/${projectId}/pause`, { paused });
  return res.data;
};

/**
 * Sends a request to the backend to set a new message limit for a project.
 * @param {number} projectId - The ID of the project to update.
 * @param {number | string} limit - The new message limit.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const setMessageLimit = async (projectId, limit) => {
  // Ensure the limit is sent as a number, as input fields might provide a string.
  const res = await api.patch(`/settings/project/${projectId}/limit`, {
    limit: Number(limit),
  });
  return res.data;
};

/**
 * Sends a request to the backend to switch the active API token for a project.
 * @param {number} projectId - The ID of the project to update.
 * @param {number} tokenId - The ID of the new token to assign to the project.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const switchToken = async (projectId, tokenId) => {
  const res = await api.patch(`/settings/project/${projectId}/token`, { tokenId });
  return res.data;
};
