// File: backend/controllers/projectSettingsController.js
// Description: Handles updates to project-level settings like token assignment, pause state, and message limits.

const tryCatch = require('../utils/tryCatch');
const settingsService = require('../services/settingsService');
const projectService = require('../services/projectService');
const { 
  isSnapshotProject, 
  isLimitExceededForDemo,
  isProtectedProject
} = require('../utils/projectLocks');

/**
 * PATCH /api/projects/:id/token
 * Assigns a new token to the specified project.
 * Snapshot projects cannot be modified.
 */
const switchToken = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);
  const { tokenId } = req.body;

  if (isProtectedProject(userId, projectId)) {
    throw { status: 403, message: 'Tokens cannot be switched on demo projects.' };
  }

  const updated = await settingsService.switchProjectToken(projectId, tokenId, userId);
  if (!updated) throw 'project.notFound';

  return null;
}, 'project.tokenSwitched');

/**
 * PATCH /api/projects/:id/pause
 * Sets the pause state of a project (true/false).
 * Snapshot projects cannot be resumed or modified.
 */
const pauseProject = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);
  const { paused } = req.body;

  if (isSnapshotProject(userId, projectId)) {
    throw { status: 403, message: 'project.snapshotModified' };
  }

  const updated = await projectService.updateProjectStatus(projectId, userId, paused);
  if (!updated) throw 'project.notFound';

  return null;
}, req.body.paused ? 'project.paused' : 'project.resumed');

/**
 * PATCH /api/projects/:id/limit
 * Sets a new message limit for the project.
 * Snapshot and demo limits are enforced.
 */
const setMessageLimit = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = Number(req.params.id);
  const { limit } = req.body;

  if (isSnapshotProject(userId, projectId)) {
    throw { status: 403, message: 'project.snapshotModified' };
  }

  if (isLimitExceededForDemo(userId, limit)) {
    throw { status: 403, message: 'project.limitExceeded' };
  }

  const updated = await settingsService.setMessageLimit(projectId, limit, userId);
  if (!updated) throw 'project.notFound';

  return null;
}, 'project.limitSet');

module.exports = {
  switchToken,
  pauseProject,
  setMessageLimit,
};