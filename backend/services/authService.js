// File: backend/services/authService.js
// Description: Provides database operations related to user authentication.

const db = require('../config/db');

/**
 * Finds a user by their email address.
 * Returns null if no match is found.
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT id, username, email, password_hash
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;
  return await db.oneOrNone(query, [email]);
};

/**
 * Creates a new user with the given credentials.
 */
const createUser = async ({ username, email, passwordHash }) => {
  const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, username, email;
  `;
  return await db.one(query, [username, email, passwordHash]);
};

module.exports = {
  findUserByEmail,
  createUser,
};
