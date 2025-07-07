// FILE: src/components/messages/ConversationView.jsx
// Purpose: Displays the full view of a single conversation, including its messages
//          and an input for sending new messages.

import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './ConversationView.module.css';

// Custom hooks for data fetching and mutations
import { useFilteredMessages } from '../../hooks/messages/useFilteredMessages';
import { useSendMessage } from '../../hooks/messages/useSendMessage';
import { useAgents } from '../../hooks/agents/useAgents';
import { DEMO_PROJECT_IDS } from '../../config/demoIds';
import { showToast } from '../../utils/toastUtils';

/**
 * ConversationView displays a selected conversation's messages and provides an
 * input field to send new messages. It filters messages based on the active
 * tab type (system, agents, etc.) and relies on its child, MessageList, to handle
 * auto-scrolling.
 *
 * @param {object} props - The component's properties.
 * @param {string|number|null} props.conversationId - The ID of the currently selected conversation.
 * @param {string} props.projectId - The ID of the project this conversation belongs to.
 * @param {boolean} [props.readOnly=false] - If true, the message input will be disabled.
 * @param {'system'|'agents'|'default'} [props.tabType='system'] - Determines which messages to display.
 * @returns {JSX.Element} A div element containing the conversation view.
 */
const ConversationView = ({
  conversationId,
  projectId,
  readOnly = false,
  tabType = 'system',
}) => {
  // --- Data Fetching ---
  const { data: agents = [] } = useAgents();
  const sendMutation = useSendMessage(conversationId, projectId);

  // --- Data Processing and Filtering ---

  // Create a quick lookup map of agent IDs to agent objects.
  const agentMap = agents.reduce((acc, agent) => {
    acc[agent.id] = agent;
    return acc;
  }, {});

  /**
   * Defines the filter function passed to `useFilteredMessages`.
   * @param {object} m - The message object to evaluate.
   * @returns {boolean} True if the message should be included.
   */
  const filterFn = (m) => {
    if (!conversationId) return false;
    if (tabType === 'system') return m.type !== 'log';
    if (tabType === 'agents') return m.type === 'assistant';
    return true;
  };

  // Fetch and filter messages for the current conversation using our custom hook.
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useFilteredMessages(conversationId, filterFn);

  // --- Event Handlers ---

  /**
   * Handles the logic for sending a new message.
   * @param {string} text - The message content to send.
   */
  const handleSend = (text) => {
    if (DEMO_PROJECT_IDS.includes(Number(projectId))) {
      return showToast('Message sending is disabled in demo projects.', 'warn');
    }
    if (!text.trim()) return; // Don't send empty messages.
    sendMutation.mutate(text.trim());
  };

  /**
   * A callback function passed to MessageList to get the display name for a sender.
   * @param {object} msg - The message object.
   * @returns {string} The display name of the sender.
   */
  const renderSender = (msg) => {
    if (msg.senderId === 0) return 'System/User'; // Special case for system/user.
    return agentMap[msg.senderId]?.name || `Agent ${msg.senderId}`;
  };

  // --- Render Logic ---

  if (!conversationId) {
    return <div className={styles.loading}>No conversation selected.</div>;
  }

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loading}>Loading messages...</div>
      ) : (
        <>
          {/* MessageList now handles its own scrolling. */}
          <MessageList messages={messages} renderSender={renderSender} />

          {/* Render the message input only if the view is not read-only. */}
          {!readOnly && (
            <MessageInput
              onSend={handleSend}
              disabled={sendMutation.isPending || isLoading}
            />
          )}

          {/* Display error messages if something goes wrong. */}
          {isError && <div className={styles.error}>Failed to load messages.</div>}
          {sendMutation.isError && (
            <div className={styles.error}>Failed to send message.</div>
          )}
        </>
      )}
    </div>
  );
};

export default ConversationView;