// FILE: src/components/messages/MessagePanel.jsx
// Purpose: Displays a single chat message within a conversation. It dynamically
//          applies styling based on the message sender (user, assistant, or unknown)
//          and formats the message content and timestamp.

import React from 'react';
import styles from './MessagePanel.module.css'; // Imports CSS module for styling message appearance
import { formatTime } from '../../utils/formatUtils'; // Utility to format timestamps

/**
 * Extracts the main body content from a raw message string.
 * It looks for a "body:" prefix and returns the text after it, otherwise returns the original string.
 * @param {string} raw - The raw message content string.
 * @returns {string} The extracted and trimmed message body, or the original raw string.
 */
const extractBody = (raw) => {
  // Use a regular expression to find "body:" (case-insensitive) followed by any characters.
  const match = raw?.match(/body:\s*([\s\S]*)/i);
  // If a match is found, return the captured group (the content after "body:").
  // Otherwise, return the original raw string.
  return match ? match[1].trim() : raw;
};

/**
 * MessagePanel component renders an individual chat message, applying
 * distinct styles based on whether the message is from an assistant, user, or an unknown source.
 * It also formats the message's creation time and extracts its content.
 *
 * @param {object} props - The component's properties.
 * @param {object} props.message - The message object to display.
 * @param {string} props.message.content - The raw content of the message.
 * @param {string} props.message.createdAt - The timestamp when the message was created.
 * @param {string} props.message.role - The role of the sender (e.g., 'assistant', 'user').
 * @param {string} [props.message.status] - Optional status of the message (e.g., 'pending', 'sent').
 * @param {string} props.sender - The name of the sender to be displayed (e.g., "AI Assistant", "You").
 * @returns {JSX.Element} A div element representing the formatted message panel.
 */
const MessagePanel = ({ message, sender }) => {
  // Extract the main content of the message using the helper function.
  const content = extractBody(message.content || '');
  // Format the message's creation timestamp.
  const time = formatTime(message.createdAt);
  // Construct the status tag, if a message status exists.
  const statusTag = message.status ? `[${message.status}]` : '';

  // Determine if the message is from an assistant or a user based on its role.
  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';

  return (
    <div
      className={`${styles.message} ${
        // Dynamically apply specific styles based on the sender's role.
        isAssistant ? styles.assistant : isUser ? styles.user : styles.unknown
      }`}
    >
      {/* Message Header: displays sender name and timestamp */}
      <div className={styles.header}>
        <span className={styles.name}>{sender}</span>
        <span className={styles.time}>{time}</span>
      </div>
      {/* Message Body: displays the main content and an optional status tag */}
      <div className={styles.body}>
        {content} {statusTag && <span className={styles.statusTag}>{statusTag}</span>}
        {/* Note: The CSS for .body::after can be used to dynamically inject this statusTag
            if you prefer a pure CSS approach for a simple string. For more complex elements,
            inline JSX as above is more flexible. If you want to use the CSS `::after`,
            you'd typically set a data-attribute on the .body div and read it in CSS.
            For now, I've opted for direct JSX rendering of the status tag for clarity
            and flexibility, assuming `statusTag` might be more than just a simple string.
            If you want to stick *strictly* to the `::after` pseudo-element for `statusTag`,
            we would need to pass the status to the `body` div as a data attribute, e.g.:
            <div className={styles.body} data-status={message.status}>
                {content}
            </div>
            And then modify the CSS:
            .body::after {
                content: attr(data-status) ? '[' attr(data-status) ']' : '';
                ...
            }
            Let me know if you prefer that approach for the status tag.
        */}
      </div>
    </div>
  );
};

export default MessagePanel;