const db = require('../config/db');

/**
 * Retrieves all tokens for a specific user.
 * Adds a flag `is_used` to indicate if the token is linked to any project.
 */
const getTokensByUser = async (userId) => {
  const query = `
    SELECT t.id, t.name, t.created_at, t.user_id, t.active,
           EXISTS (
             SELECT 1 FROM project_tokens pt
             WHERE pt.token_id = t.id
           ) AS is_used
    FROM tokens t
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC;
  `;
  return await db.any(query, [userId]);
};

/**
 * Creates a new token for the given user.
 */
const createToken = async ({ userId, name, apiKey }) => {
  const query = `
    INSERT INTO tokens (user_id, name, api_key)
    VALUES ($1, $2, $3)
    RETURNING id, name, created_at, user_id, active;
  `;
  return await db.one(query, [userId, name, apiKey]);
};

/**
 * Deletes a token if it is not currently used in any project.
 */
const deleteToken = async (tokenId, userId) => {
  const usage = await db.oneOrNone(`
    SELECT 1 FROM project_tokens WHERE token_id = $1 LIMIT 1;
  `, [tokenId]);

  if (usage) {
    throw new Error('Cannot delete: token is used in a project.');
  }

  const result = await db.oneOrNone(`
    DELETE FROM tokens WHERE id = $1 AND user_id = $2 RETURNING id;
  `, [tokenId, userId]);

  return !!result;
};

/**
 * Disables a token by setting its `active` flag to false.
 */
const disableToken = async (tokenId, userId) => {
  const result = await db.oneOrNone(`
    UPDATE tokens SET active = false WHERE id = $1 AND user_id = $2 RETURNING id;
  `, [tokenId, userId]);

  return !!result;
};

/**
 * Enables a token by setting its `active` flag to true.
 */
const enableToken = async (tokenId, userId) => {
  const result = await db.oneOrNone(`
    UPDATE tokens SET active = true WHERE id = $1 AND user_id = $2 RETURNING id;
  `, [tokenId, userId]);

  return !!result;
};

/**
 * Checks if a given token is active and belongs to the user.
 * @param {number} tokenId
 * @param {number} userId 
 * @returns {Promise<boolean>}
 */
const isTokenActive = async (tokenId, userId) => {
  if (!tokenId || !userId) return false;
  const token = await db.oneOrNone(
    'SELECT active FROM tokens WHERE id = $1 AND user_id = $2',
    [tokenId, userId]
  );
  return token ? token.active : false;
};

module.exports = {
  getTokensByUser,
  createToken,
  deleteToken,
  disableToken,
  enableToken,
  isTokenActive, 
};
