// FILE: frontend/src/utils/formatUtils.js
// Purpose: Provides common utility functions for formatting data, such as dates
//          and times, for display in the user interface.

/**
 * Formats an ISO timestamp string into a human-readable time (e.g., "11:02 PM").
 *
 * It uses the user's local timezone and formats the time without seconds.
 *
 * @param {string | null | undefined} timestamp - The ISO 8601 timestamp string to format.
 * @returns {string} The formatted time string, or an empty string if the
 * input timestamp is null or undefined.
 */
export const formatTime = (timestamp) => {
  // Guard clause: If the timestamp is null, undefined, or an empty string,
  // return an empty string to avoid errors and render nothing.
  if (!timestamp) {
    return '';
  }

  // Create a new Date object from the provided timestamp string.
  const date = new Date(timestamp);

  // Use `toLocaleTimeString` to format the date according to the user's locale.
  // The options object specifies the desired format:
  // - hour: '2-digit' (e.g., 09, 11)
  // - minute: '2-digit' (e.g., 05, 30)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
