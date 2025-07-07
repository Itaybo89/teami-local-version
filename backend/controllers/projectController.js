// File: backend/controllers/projectController.js
// Description: Handles project-level operations such as create, fetch, delete, and status update.

const tryCatch = require('../utils/tryCatch');
const { normalizeProject, normalizeProjectDetailed } = require('../utils/normalize');
const { resSuccess } = require('../utils/responseSender');
const projectService = require('../services/projectService');
// --- FIX: Import the new validation function ---
const { isProtectedProject, isSnapshotProject, validateTokenIsActive } = require('../utils/projectLocks');

/**
 * GET /api/projects
 * Returns all projects owned by the user, including their agents.
 */
const getProjects = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projects = await projectService.getProjectsByUserWithAgents(userId);
  return projects.map(normalizeProject);
});

/**
 * GET /api/projects/:id
 * Returns full details of a single project, including members and metadata.
 */
const getProjectById = (req, res) => tryCatch(res, async () => {
  const projectId = req.params.id;
  const userId = req.user.id;

  const project = await projectService.getProjectById(projectId, userId);
  if (!project) throw 'project.notFound';

  return normalizeProjectDetailed(project);
});

/**
 * POST /api/projects
 * Creates a new project with inline agent definitions and optional token binding.
 */
const createProject = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const {
    title,
    description,
    systemPrompt,
    agents = [],   // Inline agent definitions
    tokenId = null // Optional default token
  } = req.body;

  // --- FIX: Add validation for the provided token ---
  // If a tokenId is provided, ensure it is valid and active before proceeding.
  if (tokenId) {
    await validateTokenIsActive(tokenId, userId);
  }

  // Step 1: Create the project and assign agents
  const project = await projectService.createProjectWithMembers(
    userId,
    title,
    description,
    systemPrompt,
    agents,
    tokenId
  );

  // Step 2: Fetch the full project object with linked members
  const fullProject = await projectService.getProjectById(project.id, userId);
  return resSuccess(res, normalizeProjectDetailed(fullProject));
}, 'project.createSuccess');

/**
 * DELETE /api/projects/:id
 * Deletes a user-owned project unless it's protected (e.g., demo).
 */
const deleteProject = (req, res) => tryCatch(res, async () => {
  const projectId = Number(req.params.id);
  const userId = req.user.id;

  if (isProtectedProject(userId, projectId)) {
    throw { status: 403, message: 'project.protectedDemo' };
  }

  const deleted = await projectService.deleteProject(projectId, userId);
  if (!deleted) throw 'project.notFound';

  return null;
}, 'project.deleteSuccess');

/**
 * PATCH /api/projects/:id/status
 * Updates the paused status of a project.
 * Snapshot projects cannot be resumed once locked.
 */
const updateProjectStatus = (req, res) => tryCatch(res, async () => {
  const { id } = req.params;
  const { paused } = req.body;
  const userId = req.user.id;
  const projectId = Number(id);

  if (!paused && isSnapshotProject(userId, projectId)) {
    throw { status: 403, message: 'project.snapshotLocked' };
  }

  const updatedProject = await projectService.updateProjectStatus(id, userId, paused);
  if (!updatedProject) {
    throw { status: 404, message: 'project.notFound' };
  }

  return {
    success: true,
    message: 'Project status updated successfully.',
  };
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProjectStatus
};
