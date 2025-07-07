// FILE: src/components/messages/MessageInput.jsx
// Purpose: Provides a text input area and a send button for users to compose and
//          send messages within a conversation view. It supports multi-line input
//          and keyboard shortcuts for sending.

import React, { useState } from 'react';
import styles from './MessageInput.module.css'; // Imports CSS module for styling

/**
 * MessageInput component provides an interface for users to type and send messages.
 * It features a resizable textarea, a send button, and handles keyboard shortcuts
 * like Enter to send and Shift+Enter for new lines.
 *
 * @param {object} props - The component's properties.
 * @param {Function} props.onSend - Callback function executed when a message is submitted.
 * It receives the trimmed message text as an argument.
 * @param {boolean} [props.disabled=false] - If true, the input and button will be disabled,
 * preventing user interaction.
 * @returns {JSX.Element} A form element containing the message input textarea and send button.
 */
const MessageInput = ({ onSend, disabled = false }) => {
  // State to manage the current value of the textarea input.
  const [text, setText] = useState('');

  /**
   * Handles the submission of the message form.
   * Prevents default form submission, trims the input, calls `onSend` if valid,
   * and then clears the input field.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload).
    // Do not send if text is empty/whitespace or if the input is disabled.
    if (!text.trim() || disabled) return;
    onSend(text.trim()); // Call the onSend prop with the trimmed message text.
    setText(''); // Clear the input field after sending.
  };

  /**
   * Handles keydown events in the textarea for keyboard shortcuts.
   * Allows sending a message with `Enter` and adding a new line with `Shift+Enter`.
   * @param {KeyboardEvent} e - The keyboard event object.
   */
  const handleKeyDown = (e) => {
    // If Enter key is pressed and Shift key is NOT pressed, send the message.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter key behavior (new line).
      handleSubmit(e);    // Trigger the message submission.
    }
    // If Shift+Enter is pressed, the default behavior (new line) will occur,
    // which is desired, so no `e.preventDefault()` is needed here.
  };

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        placeholder="Type a message... (Shift + Enter for new line)"
        value={text}
        onChange={(e) => setText(e.target.value)} // Update state on input change.
        onKeyDown={handleKeyDown}                 // Handle keyboard shortcuts.
        disabled={disabled}                       // Disable input based on prop.
        rows="4" // Initial number of rows for the textarea. Note: max-height is handled by CSS.
      />
      <button type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
};

export default MessageInput;