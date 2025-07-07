// FILE: src/components/common/Badge.jsx
// Purpose: A simple, reusable presentational component to display text
//          with distinct background coloring based on a specified 'type'.
//          Commonly used for status indicators.

import React from 'react';
import styles from './Badge.module.css'; // Imports CSS module for badge styling

/**
 * Badge component displays a small, styled text label.
 * It's designed to visually categorize or indicate the status of an item
 * (e.g., 'active', 'disabled', 'default') by applying different background colors.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.text - The text content to display inside the badge.
 * @param {string} [props.type='default'] - The type of badge, which corresponds to a CSS class
 * in `Badge.module.css` (e.g., 'active', 'disabled', 'default') to apply specific styling.
 * @returns {JSX.Element} A span element styled as a badge.
 */
const Badge = ({ text, type = 'default' }) => {
  return (
    <span className={`${styles.badge} ${styles[type]}`}>
      {text}
    </span>
  );
};

export default Badge;