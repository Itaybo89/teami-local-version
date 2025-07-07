// FILE: src/components/messages/ConversationList.jsx
// Purpose: Displays a scrollable list of conversations, allowing users to select
//          a specific conversation to view its details. It highlights the currently
//          selected conversation and provides a placeholder for empty lists.

import React from 'react';
import styles from './ConversationList.module.css'; // Imports CSS module for styling

/**
 * ConversationList component renders a list of clickable conversation items.
 * It's responsible for displaying conversation titles, marking the active
 * conversation, and handling selection events.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.conversations - An array of conversation objects to display.
 * Each object should at least have an `id` and a `title`.
 * @param {string | number | null} props.selectedId - The ID of the currently selected conversation.
 * @param {Function} props.onSelect - Callback function to be called when a conversation is selected.
 * It receives the ID of the selected conversation as an argument.
 * @returns {JSX.Element} A div element containing the conversation list or a placeholder.
 */
const ConversationList = ({ conversations, selectedId, onSelect }) => {
  // If there are no conversations provided, display a placeholder message.
  if (!conversations.length) {
    return <div className={styles.placeholder}>No conversations available.</div>;
  }

  return (
    <div className={styles.list}>
      {/* Heading for the conversation list */}
      <h4>Conversations</h4>
      {/* Unordered list to render individual conversation items */}
      <ul className={styles.ul}>
        {/* Map over the conversations array to render each conversation as a list item */}
        {conversations.map((c) => (
          <li
            key={c.id} // Unique key for React list rendering
            // Dynamically apply 'active' class if the current conversation's ID matches selectedId
            className={`${styles.item} ${selectedId === c.id ? styles.active : ''}`}
            onClick={() => onSelect(c.id)} // Calls onSelect prop with the conversation's ID when clicked
            // Set the title attribute for tooltip on hover, showing full conversation title
            title={c.title || `Conversation ${c.id}`}
          >
            {/* Span to display the conversation title, with text overflow handling */}
            <span className={styles.titleText}>
              {/* Fallback to "Conversation [ID]" if title is not available */}
              {c.title || `Conversation ${c.id}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;