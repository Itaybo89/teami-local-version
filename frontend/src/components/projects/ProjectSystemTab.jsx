// FILE: src/components/projects/ProjectSystemTab.jsx
// Purpose: Defines the content for the "System Message" tab within the project workspace.
// This tab allows the user to view and interact with agents on behalf of the system.

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './ProjectSystemTab.module.css';

// Import child components
import ConversationList from './ConversationList';
import ConversationView from '../messages/ConversationView';

// Import custom hooks and utilities
import { useAgents } from '../../hooks/agents/useAgents';
import { useConversations } from '../../hooks/conversations/useConversations';
import { normalizeConversation } from '../../utils/normalize';
import { formatConversationTitle } from '../../utils/formatConversationTitle';

/**
 * A component that displays a list of conversations between the "System" agent
 * and other agents in the project, allowing the user to view and send messages
 * as the system.
 *
 * @param {object} props - The component's props.
 * @param {string | number} props.projectId - The ID of the current project.
 * @param {string} [props.tabType='system'] - The type of tab, used for potential styling or logic.
 * @returns {React.ReactElement} The rendered system message tab.
 */
const ProjectSystemTab = ({ projectId: passedProjectId, tabType = 'system' }) => {
  // Get the project ID from the URL parameters as a fallback.
  const { id: routeProjectId } = useParams();
  const projectId = passedProjectId || routeProjectId;

  // --- Data Fetching ---
  const { data: agents = [] } = useAgents(); // Fetch all agents for name lookups.
  const { data: allConversations = [] } = useConversations(projectId);

  // --- State Management ---
  // State to keep track of the currently selected conversation ID.
  const [selectedId, setSelectedId] = useState(null);

  // --- Data Processing ---

  // Create a map of agent IDs to agent objects for quick lookups.
  const agentMap = {};
  agents.forEach((a) => {
    agentMap[a.id] = a;
  });

  // Filter and deduplicate conversations to only show unique pairs involving the System agent (ID 0).
  const seen = new Set();
  const systemConversations = [];

  // 1. Filter for conversations where the system is either the sender or receiver.
  for (const c of allConversations.filter(c => c.senderId === 0 || c.receiverId === 0)) {
    // 2. Normalize the conversation to get a stable `pairKey`.
    const norm = normalizeConversation(c, agentMap);
    // 3. If this pair has not been seen before, add it to the list.
    if (!seen.has(norm.pairKey)) {
      seen.add(norm.pairKey);
      systemConversations.push({
        ...norm,
        // 4. Generate a user-friendly title for the conversation.
        title: formatConversationTitle(norm, agentMap),
      });
    }
  }

  // --- Effects ---

  /**
   * An effect to automatically select the first conversation in the list when
   * the component first loads, providing a default view for the user.
   */
  useEffect(() => {
    if (!selectedId && systemConversations.length > 0) {
      setSelectedId(systemConversations[0].id);
    }
    // This effect runs when the conversations load or if the selected ID changes.
  }, [systemConversations, selectedId]);


  // --- Render Logic ---
  return (
    <div className={styles.systemTab}>
      <ConversationList
        conversations={systemConversations}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <div className={styles.chatArea}>
        {selectedId ? (
          // If a conversation is selected, render the full view for it.
          <ConversationView
            conversationId={selectedId}
            readOnly={false} // User can send messages as the system.
            projectId={projectId}
            tabType={tabType}
          />
        ) : (
          // If no conversation is selected (or none exist), show a placeholder.
          <div className={styles.placeholder}>
            Select a conversation to interact with agents as the System.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSystemTab;
