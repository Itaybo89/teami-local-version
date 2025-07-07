// File: backend/middleware/validateInput.js
// Description: Middleware to validate request body using a provided Zod schema.

const { resError } = require('../utils/responseSender');

/**
 * Middleware factory that validates req.body against a Zod schema.
 * If validation fails, responds with 422 Unprocessable Entity.
 */
const validateInput = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues?.[0]?.message || 'Invalid input';
    return resError(res, message, 422);
  }

  req.body = result.data; // Use sanitized, validated data
  next();
};

module.exports = validateInput;
