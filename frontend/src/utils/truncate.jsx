// FILE: frontend/src/utils/truncate.jsx
// Purpose: Provides a React component for truncating text and displaying
//          the full content on hover.

import React from 'react';

/**
 * A React component that truncates a string to a specified length and displays
 * the full text in a tooltip when the user hovers over it.
 *
 * If the text is shorter than or equal to the max length, it's returned as is.
 * Otherwise, it's truncated with an ellipsis and wrapped in a <span> element
 * with a `title` attribute containing the full text.
 *
 * @param {string | number | null | undefined} text - The text to be truncated.
 * The component will safely handle non-string inputs by converting them.
 * @param {number} [maxLength=30] - The maximum number of characters to display
 * before truncating. Defaults to 30.
 * @returns {React.ReactElement | string} A React element (<span>) if truncated,
 * or the original text string if not.
 */
export const truncateWithHover = (text, maxLength = 30) => {
  // Gracefully handle null or undefined input.
  if (!text) {
    return '';
  }

  // Ensure the input is treated as a string for consistency.
  const cleanText = String(text);

  // If the text is already short enough, return it directly without any JSX.
  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  // If the text is too long, return a JSX span.
  // The 'title' attribute creates a native browser tooltip on hover.
  return (
    <span title={cleanText}>
      {`${cleanText.slice(0, maxLength)}…`}
    </span>
  );
};
