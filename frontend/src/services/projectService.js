// FILE: src/services/projectService.js
// Purpose: Provides a dedicated service for all API interactions related to projects.
// This includes fetching, creating, updating, and deleting projects.

import api from './api';
import { normalizeProject, normalizeProjectForSubmit } from '../utils/normalize';

/**
 * Fetches all projects for the currently authenticated user.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of normalized project objects.
 */
export const fetchProjects = async () => {
  const res = await api.get('/projects');
  // Normalize each project in the response array to ensure a consistent data structure.
  return res.data.map(normalizeProject);
};

/**
 * Fetches a single project by its unique ID.
 * @param {number | string} projectId - The ID of the project to fetch.
 * @returns {Promise<object>} A promise that resolves to a single normalized project object.
 */
export const fetchProjectById = async (projectId) => {
  const res = await api.get(`/projects/${projectId}`);
  return normalizeProject(res.data);
};

/**
 * Creates a new project with its initial agent configuration.
 * @param {object} projectData - The project data from the creation form.
 * @returns {Promise<object>} A promise that resolves to the newly created, normalized project object.
 */
export const createProject = async (projectData) => {
  // Normalize the form data into a clean payload before sending it to the API.
  const payload = normalizeProjectForSubmit(projectData);
  const res = await api.post('/projects', payload);
  return normalizeProject(res.data);
};

/**
 * Updates the paused status of a project.
 * @param {string|number} projectId - The ID of the project to update.
 * @param {boolean} isPaused - The new paused state (true to pause, false to resume).
 * @returns {Promise<object>} A promise that resolves to the updated, normalized project object.
 */
export const updateProjectStatus = async (projectId, isPaused) => {
    const res = await api.post(`/projects/${projectId}/status`, { paused: isPaused });
    return normalizeProject(res.data);
};

/**
 * Deletes a project by its ID.
 * @param {number | string} projectId - The ID of the project to delete.
 * @returns {Promise<object>} A promise that resolves to the confirmation message from the API.
 */
export const deleteProject = async (projectId) => {
  const res = await api.delete(`/projects/${projectId}`);
  return res.data;
};
