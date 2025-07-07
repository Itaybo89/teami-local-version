// FILE: src/components/projects/ProjectAgentsTab.jsx
// Purpose: Displays a list of agent-to-agent conversations for a specific project
//          and allows users to view the messages within a selected conversation.
//          It reuses some layout styles from ProjectSystemTab.module.css.

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// Reusing layout styles from ProjectSystemTab, as the visual structure might be similar.
import styles from './ProjectSystemTab.module.css';

import ConversationList from './ConversationList'; // Component to list conversations
import ConversationView from '../messages/ConversationView'; // Component to display messages of a conversation

import { useAgents } from '../../hooks/agents/useAgents'; // Custom hook to fetch agents
import { useConversations } from '../../hooks/conversations/useConversations'; // Custom hook to fetch conversations
import { normalizeConversation } from '../../utils/normalize'; // Utility to normalize conversation data
import { formatConversationTitle } from '../../utils/formatConversationTitle'; // Utility to format conversation titles

/**
 * ProjectAgentsTab component displays a dynamic interface for managing and viewing
 * conversations between agents within a specific project.
 *
 * It fetches all agents and conversations related to a project, filters for
 * agent-to-agent conversations, and allows the user to select a conversation
 * to view its messages in detail.
 *
 * @param {object} props - The component's properties.
 * @param {string} [props.projectId] - The ID of the project. If not provided, it attempts to get it from the URL parameters.
 * @param {boolean} [props.readOnly=true] - If true, the conversation view will be read-only.
 * @param {string} [props.tabType='agents'] - Specifies the type of the current tab, used for ConversationView context.
 * @returns {JSX.Element} A div element containing the conversation list and conversation view.
 */
const ProjectAgentsTab = ({ projectId: passedProjectId, readOnly = true, tabType = 'agents' }) => {
  // Extract project ID from the URL parameters.
  const { id: routeProjectId } = useParams();
  // Determine the project ID to use: preference is given to `passedProjectId` prop,
  // otherwise, it falls back to `routeProjectId` from URL.
  const projectId = passedProjectId || routeProjectId;

  // Fetch agents for the current project. Defaults to an empty array if no data.
  const { data: agents = [] } = useAgents(projectId);
  // Fetch all conversations for the current project. Defaults to an empty array if no data.
  const { data: allConversations = [] } = useConversations(projectId);

  // State to keep track of the currently selected conversation's ID.
  const [selectedId, setSelectedId] = useState(null);
  // State to keep track of the sender agent's ID for the selected conversation.
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Create a map of agents for quick lookup by ID.
  // This helps in normalizing conversation data and formatting titles efficiently.
  const agentMap = {};
  agents.forEach((a) => {
    agentMap[a.id] = a;
  });

  // --- Conversation Deduplication and Normalization ---
  // A Set to keep track of seen conversation pair keys (e.g., 'agent1-agent2') to avoid duplicates.
  const seen = new Set();
  // Array to store the filtered and normalized agent-to-agent conversations.
  const agentConversations = [];

  // Iterate through all fetched conversations to filter and normalize them.
  // We're interested in conversations where both senderId and receiverId are not 0 (which might imply system/user).
  for (const c of allConversations.filter(c => c.senderId !== 0 && c.receiverId !== 0)) {
    // Normalize the conversation data, enriching it with agent details from agentMap.
    const norm = normalizeConversation(c, agentMap);
    // If this unique agent pair (pairKey) hasn't been seen yet, add it to our list.
    if (!seen.has(norm.pairKey)) {
      seen.add(norm.pairKey);
      agentConversations.push({
        ...norm,
        // Format the conversation title using the normalized data and agent map.
        title: formatConversationTitle(norm, agentMap),
      });
    }
  }

  // --- Effect Hook for Initial Conversation Selection ---
  // This effect runs when `agentConversations` or `selectedId` changes.
  useEffect(() => {
    // If no conversation is currently selected AND there are available agent conversations,
    // automatically select the first one in the list.
    if (!selectedId && agentConversations.length > 0) {
      const first = agentConversations[0];
      setSelectedId(first.id);
      setSelectedAgentId(first.senderId);
    }
  }, [agentConversations, selectedId]); // Dependencies: re-run if these values change.

  /**
   * Handles the selection of a conversation from the list.
   * Updates the `selectedId` and `selectedAgentId` states.
   * @param {string | number} id - The ID of the conversation to be selected.
   */
  const handleSelect = (id) => {
    setSelectedId(id);
    // Find the full conversation object based on the selected ID to get its sender ID.
    const found = agentConversations.find((c) => c.id === id);
    if (found) setSelectedAgentId(found.senderId);
  };

  return (
    // The main container for the agents tab, reusing styles.
    <div className={styles.systemTab}>
      {/* Component to display the list of agent conversations */}
      <ConversationList
        conversations={agentConversations} // Pass the filtered and normalized agent conversations
        selectedId={selectedId} // Pass the ID of the currently selected conversation
        onSelect={handleSelect} // Callback function when a conversation is selected
      />
      {/* Area to display the messages of the selected conversation */}
      <div className={styles.chatArea}>
        {/* Conditionally render ConversationView if a conversation is selected,
            otherwise show a placeholder message. */}
        {selectedId ? (
          <ConversationView
            conversationId={selectedId} // The ID of the conversation to display
            projectId={projectId} // The current project ID
            readOnly={true} // Prop to control editability
            tabType={tabType} // Context for the conversation view (e.g., 'agents' vs 'user')
            agentId={selectedAgentId} // The ID of the agent associated with the selected conversation (e.g. sender)
          />
        ) : (
          // Placeholder text when no conversation is selected
          <div className={styles.placeholder}>
            Select a conversation to view agent responses.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAgentsTab;