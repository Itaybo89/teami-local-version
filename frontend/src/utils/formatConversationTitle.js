// FILE: frontend/src/utils/formatConversationTitle.js
// Purpose: Provides a utility function to create a human-readable title
//          for a conversation based on its participants.

/**
 * Formats a user-friendly title for a conversation.
 *
 * It handles two main cases:
 * 1. A conversation involving the "System" agent (ID 0), in which case
 * it just shows the name of the other participating agent.
 * 2. A standard agent-to-agent conversation, formatted as "Sender → Receiver".
 *
 * @param {object} conversation - The conversation object, containing `senderId` and `receiverId`.
 * @param {object} agentMap - A map where keys are agent IDs and values are agent objects
 * (e.g., { id: 1, name: 'Agent A' }).
 * @returns {string} A formatted, human-readable title for the conversation.
 */
export const formatConversationTitle = (conversation, agentMap) => {
  if (!conversation || !agentMap) {
    return 'Unknown Conversation';
  }
  
  const { senderId, receiverId } = conversation;

  // Case 1: Handle conversations involving the System agent (ID 0).
  // These are typically one-way communications or system announcements.
  // The title should just be the name of the non-system agent.
  if (senderId === 0 || receiverId === 0) {
    // Identify the ID of the agent that is NOT the system.
    const agentId = senderId === 0 ? receiverId : senderId;
    // Look up the agent's name, with a fallback if not found.
    return agentMap[agentId]?.name || `Agent ${agentId}`;
  }

  // Case 2: Handle standard agent-to-agent conversations.
  // The title clearly indicates the direction of the initial message.
  const sender = agentMap[senderId]?.name || `Agent ${senderId}`;
  const receiver = agentMap[receiverId]?.name || `Agent ${receiverId}`;
  return `${sender} → ${receiver}`;
};
