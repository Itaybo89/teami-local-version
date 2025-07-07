// File: backend/middleware/authenticate.js
// Description: Middleware that verifies JWT from cookie and attaches user info to the request.

const { verifyToken } = require('../utils/auth/jwt');
const { resError } = require('../utils/responseSender');

/**
 * Auth middleware
 * - Checks for a JWT token in the cookie
 * - Verifies the token
 * - Attaches user ID to the request object
 * - Returns 401 if missing, 403 if invalid
 */
const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return resError(res, 'auth.missingToken', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return resError(res, 'auth.invalidToken', 403);
  }
};

module.exports = authenticate;
