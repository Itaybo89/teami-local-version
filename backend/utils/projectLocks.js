// FILE: backend/utils/projectLocks.js

const { demoUserId, demoTokenId, demoProjectId, snapshotProjectId, demoProjectLimit } = require('../env');
const tokenService = require('../services/tokenService');

/**
 * Checks if the current user is the designated demo user.
 * @param {number} userId - The ID of the user to check.
 * @returns {boolean}
 */
function isDemoUser(userId) {
  return userId === demoUserId;
}

/**
 * Checks if a project is the specific, read-only snapshot project.
 * This rule applies only to the demo user interacting with the snapshot project.
 * @param {number} userId - The ID of the current user.
 * @param {number} projectId - The ID of the project to check.
 * @returns {boolean}
 */
function isSnapshotProject(userId, projectId) {
  return isDemoUser(userId) && projectId === snapshotProjectId;
}

/**
 * Checks if a project is one of the protected projects (demo or snapshot).
 * These projects cannot be deleted by the demo user.
 * @param {number} userId - The ID of the current user.
 * @param {number} projectId - The ID of the project to check.
 * @returns {boolean}
 */
function isProtectedProject(userId, projectId) {
  return isDemoUser(userId) && (projectId === demoProjectId || projectId === snapshotProjectId);
}

/**
 * Checks if the demo user is trying to set a message limit above the global threshold.
 * This rule applies to the demo user on ANY project.
 * @param {number} userId - The ID of the user.
 * @param {number} newLimit - The new limit being proposed.
 * @returns {boolean}
 */
function isLimitExceededForDemo(userId, newLimit) {
  return isDemoUser(userId) && newLimit > demoProjectLimit;
}

/**
 * Checks if a given token is the protected demo token.
 * @param {number} userId - The ID of the current user.
 * @param {number} tokenId - The ID of the token to check.
 * @returns {boolean}
 */
function isProtectedDemoToken(userId, tokenId) {
  return isDemoUser(userId) && tokenId === demoTokenId;
}

/**
 * Validates that a token is active for a given user.
 * @param {number} tokenId - The ID of the token.
 * @param {number} userId - The ID of the user.
 */
async function validateTokenIsActive(tokenId, userId) {
  if (!tokenId || !(await tokenService.isTokenActive(tokenId, userId))) {
    throw { status: 400, message: 'A valid, active API token is required.' };
  }
}

module.exports = {
  isDemoUser,
  isSnapshotProject,
  isProtectedProject,
  isLimitExceededForDemo,
  isProtectedDemoToken,
  validateTokenIsActive,
};