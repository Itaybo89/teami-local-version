// FILE: src/components/messages/SystemLog.jsx
// Purpose: Displays a single system-generated log message, including the sender,
//          timestamp, and the message content itself. It uses specific styling
//          to differentiate system logs from regular chat messages.

import React from 'react';
import styles from './SystemLog.module.css'; // Imports CSS module for styling
import { formatTime } from '../../utils/formatUtils'; // Utility function to format timestamps

/**
 * SystemLog component renders an individual system message.
 * It's designed to display administrative or operational messages,
 * providing clear visual distinction from regular user/agent conversations.
 *
 * @param {object} props - The component's properties.
 * @param {object} props.message - The message object containing log details.
 * @param {string} props.message.body - The main content of the message (preferred).
 * @param {string} props.message.content - Fallback for the main content if `body` is not available.
 * @param {string} props.message.createdAt - The timestamp of when the message was created.
 * @param {string} [props.sender='System'] - The name of the sender, defaults to 'System'.
 * @returns {JSX.Element} A div element representing a formatted system log entry.
 */
const SystemLog = ({ message, sender = 'System' }) => {
  // Determine the content to display, prioritizing `message.body` over `message.content`.
  const content = message.body || message.content;
  // Format the `createdAt` timestamp into a human-readable time string.
  const time = formatTime(message.createdAt); // The timestamp is expected to be normalized here

  return (
    <div className={styles.system}>
      {/* Header section for sender label and timestamp */}
      <div className={styles.header}>
        {/* Displays the sender's label, e.g., "System:" */}
        <strong className={styles.label}>{sender}:</strong>
        {/* Displays the formatted time, aligned to the right by CSS */}
        <span className={styles.time}>{time}</span>
      </div>
      {/* Displays the main body of the system log message */}
      <span className={styles.body}>{content}</span>
    </div>
  );
};

export default SystemLog;