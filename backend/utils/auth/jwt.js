// FILE: backend/utils/auth/jwt.js

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../env');

// Generate a JWT with optional expiration (default: 7 days)
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

// Verify and decode a JWT
const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

module.exports = {
  generateToken,
  verifyToken,
};
