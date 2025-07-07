// File: backend/controllers/tokenController.js
// Description: Manages API tokens for authenticated users — add, list, enable/disable, delete.

const tryCatch = require('../utils/tryCatch');
const { encrypt } = require('../utils/auth/encrypt');
const tokenService = require('../services/tokenService');
const { normalizeToken } = require('../utils/normalize');
const { isProtectedDemoToken } = require('../utils/projectLocks');

/**
 * GET /api/tokens
 * Retrieves all tokens owned by the current user.
 * The response is normalized and excludes actual API keys.
 */
const getTokens = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const tokens = await tokenService.getTokensByUser(userId);
  return tokens.map(normalizeToken);
});

/**
 * POST /api/tokens
 * Adds a new token for the current user.
 * The API key is encrypted before storing.
 */
const addToken = (req, res) => tryCatch(res, async () => {
  const userId = req.user.id;
  const { name, apiKey } = req.body;

  const encryptedKey = encrypt(apiKey);
  const token = await tokenService.createToken({ userId, name, apiKey: encryptedKey });

  return normalizeToken(token);
}, 'token.addSuccess');

/**
 * DELETE /api/tokens/:id
 * Deletes a token owned by the user unless it's a protected demo token.
 */
const deleteToken = (req, res) => tryCatch(res, async () => {
  const tokenId = Number(req.params.id);
  const userId = req.user.id;

  if (isProtectedDemoToken(userId, tokenId)) {
    throw { status: 403, message: 'token.protectedDemo' };
  }

  const deleted = await tokenService.deleteToken(tokenId, userId);
  if (!deleted) throw 'token.notFound';

  return null;
}, 'token.deleteSuccess');

/**
 * PATCH /api/tokens/:id/disable
 * Disables a token unless it's protected.
 */
const disableToken = (req, res) => tryCatch(res, async () => {
  const tokenId = Number(req.params.id);
  const userId = req.user.id;

  if (isProtectedDemoToken(userId, tokenId)) {
    throw { status: 403, message: 'token.protectedDemo' };
  }

  const disabled = await tokenService.disableToken(tokenId, userId);
  if (!disabled) throw 'token.notFoundOrUnauthorized';

  return null;
}, 'token.disabledSuccess');

/**
 * PATCH /api/tokens/:id/enable
 * Enables a previously disabled token.
 */
const enableToken = (req, res) => tryCatch(res, async () => {
  const tokenId = req.params.id;
  const userId = req.user.id;

  const enabled = await tokenService.enableToken(tokenId, userId);
  if (!enabled) throw 'token.notFoundOrUnauthorized';

  return null;
}, 'token.enabledSuccess');

module.exports = {
  getTokens,
  addToken,
  deleteToken,
  disableToken,
  enableToken,
};
