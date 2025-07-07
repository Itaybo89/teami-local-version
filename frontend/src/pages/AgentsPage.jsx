// FILE: src/pages/AgentsPage.jsx
// Purpose: Defines the "My Agents" page, which displays a table of all agents
//          created by the user.

import React from 'react';
import { useAgents } from '../hooks/agents/useAgents';
// The hook for deleting an agent is commented out as its functionality is currently disabled on this page.
// import { useDeleteAgent } from '../hooks/agents/useDeleteAgent';

import PageWrapper from '../components/layout/PageWrapper';
import InfoTable from '../components/tables/InfoTable';

import { agentColumns, prepareAgentTableData } from '../schemas/agentTableSchema';

/**
 * The AgentsPage component fetches and displays a list of the user's agents in a table.
 * Note: Agent creation happens within the project creation flow, so this page is currently
 * a read-only view of the agent library.
 */
const AgentsPage = () => {
  // Use the custom hook to fetch the list of agents.
  // It provides the data, loading state, and error state.
  const { data: agents = [], isLoading, isError } = useAgents();

  // The delete mutation hook and its handler function are commented out to disable
  // the agent deletion functionality from this page. This code is kept for future use.
  // const deleteAgent = useDeleteAgent();
  // const handleDeleteAgent = (id) => deleteAgent.mutate(id);

  // Filter out the global "System" agent (ID 0) so that only agents created
  // by the user are displayed in the table.
  const userAgents = agents.filter(agent => agent.id !== 0);

  // The 'onDelete' handler is not passed to the data preparation function,
  // effectively disabling the action buttons in the table. The original line
  // is commented out below for easy restoration if needed.
  // const tableData = prepareAgentTableData(userAgents, { onDelete: handleDeleteAgent });
  const tableData = prepareAgentTableData(userAgents);

  // --- Render Logic ---
  if (isLoading) {
    return <PageWrapper title="My Agents"><div>Loading agents...</div></PageWrapper>;
  }

  if (isError) {
    return <PageWrapper title="My Agents"><div>Failed to load agents. Please try again later.</div></PageWrapper>;
  }

  return (
    <PageWrapper title="My Agents">
      {/* The InfoTable component is used to render the list of agents.
          It is configured using the columns and prepared data from the schema. */}
      <InfoTable columns={agentColumns} data={tableData} />
    </PageWrapper>
  );
};

export default AgentsPage;
