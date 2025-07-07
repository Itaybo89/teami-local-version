// FILE: src/services/logService.js
// Purpose: Provides a dedicated service for API interactions related to system
//          and application logs for a specific project.

import api from './api';
import { normalizeLog } from '../utils/normalize';

/**
 * Fetches all log entries for a specific project.
 * @param {number | string} projectId - The ID of the project to fetch logs for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized log objects.
 */
export const fetchLogsByProject = async (projectId) => {
  const res = await api.get(`/logs/${projectId}`);
  // Normalize each log in the response array to ensure a consistent data structure.
  return res.data.map(normalizeLog);
};

/**
 * Deletes all log entries for a specific project.
 * @param {number | string} projectId - The ID of the project whose logs will be deleted.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const deleteLogsByProject = async (projectId) => {
  const res = await api.delete(`/logs/${projectId}`);
  return res.data;
};
