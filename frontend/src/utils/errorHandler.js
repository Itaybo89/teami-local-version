// FILE: frontend/src/utils/errorHandler.js
// Purpose: Provides utility functions for handling and parsing errors,
//          particularly from API calls.

/**
 * Extracts a user-friendly error message from various error formats.
 *
 * This function is designed to handle different types of errors that might
 * be caught in a try-catch block, such as plain strings or complex objects
 * from API responses (like those from Axios).
 *
 * @param {any} error - The error object caught. This can be a string, an
 * Axios error object, or any other type of error.
 * @returns {string} A human-readable error message.
 */
export const extractErrorMessage = (error) => {
  // Case 1: The error is already a simple string.
  if (typeof error === 'string') {
    return error;
  }

  // Case 2: The error is a structured API response error (common with Axios).
  // It safely checks for a nested message property: error.response.data.message.
  // The optional chaining (?.) prevents runtime errors if the path doesn't exist.
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Fallback Case: If the error format is unrecognized, return a generic message.
  return 'An unexpected error occurred. Please try again.';
};
