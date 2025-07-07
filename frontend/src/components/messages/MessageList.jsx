// FILE: src/components/messages/MessageList.jsx
// Purpose: Displays a scrollable list of messages within a conversation view.
//          It intelligently renders different message types and now automatically
//          scrolls to the bottom when new messages are added.

import React, { useEffect, useRef } from 'react';
import MessagePanel from './MessagePanel';
import AgentLog from './AgentLog';
import SystemLog from './SystemLog';
import styles from './MessageList.module.css';

/**
 * MessageList component renders a chronological list of various message types.
 * It automatically scrolls to the latest message when the list updates.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} [props.messages=[]] - An array of message objects to display.
 * @param {Function} [props.renderSender] - An optional function to get the sender's name.
 * @returns {JSX.Element} A div element containing the list of messages or a placeholder.
 */
const MessageList = ({ messages = [], renderSender }) => {
  // --- Auto-scroll Logic ---
  // Create a ref to attach to an element at the end of the list.
  const messagesEndRef = useRef(null);

  /**
   * A helper function to scroll the referenced element into view smoothly.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * An effect that triggers the scroll-to-bottom function whenever the
   * `messages` array changes. This ensures the view always shows the latest message.
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Dependency array ensures this runs only when messages update.


  // --- Render Logic ---
  return (
    <div className={styles.wrapper}>
      {messages.length > 0 ? (
        messages.map((msg) => {
          const sender = renderSender?.(msg);
          switch (msg.type) {
            case 'system':
              return <SystemLog key={msg.id} message={msg} sender={sender} />;
            case 'assistant':
              return <AgentLog key={msg.id} message={msg} sender={sender} />;
            default:
              return <MessagePanel key={msg.id} message={msg} sender={sender} />;
          }
        })
      ) : (
        <div className={styles.empty}>
          <h3>New Conversation</h3>
          <p>Send a message to begin.</p>
        </div>
      )}
      {/* This empty div is the "anchor" at the bottom of the list that we scroll to. */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
