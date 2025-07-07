// FILE: backend/utils/errorHandler.js

// Extract a readable message from various error types
const extractErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Unknown error';
};

module.exports = {
  extractErrorMessage,
};
