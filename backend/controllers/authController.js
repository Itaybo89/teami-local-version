// File: backend/controllers/authController.js
// Description: Handles authentication-related operations including register, login, logout, and user identity check

const tryCatch = require('../utils/tryCatch');
const { resSuccess } = require('../utils/responseSender');
const { setAuthCookie, clearAuthCookie } = require('../utils/auth/cookie');
const { hashPassword, comparePassword } = require('../utils/auth/hash');
const { generateToken } = require('../utils/auth/jwt');
const authService = require('../services/authService');

/**
 * POST /api/auth/register
 * Registers a new user account.
 * Requires: username, email, and password in the request body.
 * Responds with the user object and sets an auth cookie.
 */
const register = (req, res) => tryCatch(res, async () => {
  const { username, email, password } = req.body;

  const existing = await authService.findUserByEmail(email);
  if (existing) throw 'auth.emailInUse';

  const passwordHash = await hashPassword(password);
  const user = await authService.createUser({ username, email, passwordHash });

  const token = generateToken({ userId: user.id });
  setAuthCookie(res, token);

  return { user: { id: user.id, username, email } };
}, 'auth.registrationSuccess');

/**
 * POST /api/auth/login
 * Logs in an existing user.
 * Requires: email and password.
 * Responds with user data and sets an auth cookie.
 */
const login = (req, res) => tryCatch(res, async () => {
  const { email, password } = req.body;

  const user = await authService.findUserByEmail(email);
  if (!user) throw 'auth.failedLogin';

  const match = await comparePassword(password, user.password_hash);
  if (!match) throw 'auth.failedLogin';

  const token = generateToken({ userId: user.id });
  setAuthCookie(res, token);

  return { user: { id: user.id, username: user.username, email } };
});

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing the auth cookie.
 */
const logout = (req, res) => {
  clearAuthCookie(res);
  return resSuccess(res, null, 'Logged out');
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's basic info.
 */
const me = (req, res) => tryCatch(res, async () => {
  const { id, username, email } = req.user;
  return { user: { id, username, email } };
});

module.exports = {
  register,
  login,
  logout,
  me,
};
