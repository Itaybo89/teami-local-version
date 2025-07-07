// File: backend/controllers/logController.js
// Description: Handles API requests related to project logs (fetching and deletion)

const tryCatch = require('../utils/tryCatch');
const { normalizeLog } = require('../utils/normalize');
const logService = require('../services/logService');
const { isSnapshotProject } = require('../utils/projectLocks');

/**
 * GET /api/logs/:projectId
 * Retrieves all logs for a specific project owned by the authenticated user.
 */
const getLogsByProject = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = req.params.projectId;

  const logs = await logService.getLogsByProject(projectId, userId);
  return logs.map(normalizeLog);
});

/**
 * DELETE /api/logs/:projectId
 * Deletes all logs associated with a specific project owned by the user.
 */
const deleteLogsByProject = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const projectId = Number(req.params.projectId);

  if (isSnapshotProject(userId, projectId)) {
    throw { status: 403, message: 'Logs for snapshot projects cannot be cleared.' };
  }

  await logService.deleteLogsByProject(projectId, userId);
  return { success: true };
});

module.exports = {
  getLogsByProject,
  deleteLogsByProject,
};
