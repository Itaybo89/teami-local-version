// FILE: src/pages/TokensPage.jsx
// Purpose: Defines the "My Tokens" page where users can view, add, and manage their API tokens.

import React, { useState } from 'react';
import { useTokens } from '../hooks/tokens/useTokens';
import { useAddToken } from '../hooks/tokens/useAddToken';
import { useDeleteToken } from '../hooks/tokens/useDeleteToken';
import { useDisableToken } from '../hooks/tokens/useDisableToken';
import { useEnableToken } from '../hooks/tokens/useEnableToken';

// Import reusable components
import PageWrapper from '../components/layout/PageWrapper';
import AddItemForm from '../components/forms/AddItemForm';
import InfoTable from '../components/tables/InfoTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

// Import schema and utilities
import { tokenColumns, prepareTokenTableData } from '../schemas/tokenTableSchema';
import { DEMO_TOKEN_ID } from '../config/demoIds';
import { showToast } from '../utils/toastUtils';

/**
 * The TokensPage component is responsible for rendering the UI to manage API tokens.
 * It fetches the user's tokens and provides functionality to add, delete, enable,
 * and disable them, using custom hooks for all data mutations.
 */
const TokensPage = () => {
  // --- State for Confirmation Dialog ---
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // --- Data Fetching and Mutation Hooks ---
  // These custom hooks abstract away the API logic and state management (loading, error, data).
  const { data: tokens = [], isLoading, isError } = useTokens();
  const addTokenMutation = useAddToken();
  const deleteTokenMutation = useDeleteToken();
  const disableTokenMutation = useDisableToken();
  const enableTokenMutation = useEnableToken();

  // --- Event Handlers ---

  /**
   * Handles the form submission for adding a new token.
   * @param {object} data - The form data, containing { name, apiKey }.
   */
  const handleAddToken = (data) => {
    addTokenMutation.mutate(data);
  };

  /**
   * Opens the confirmation dialog before deleting a token.
   * @param {number} id - The ID of the token to delete.
   * @param {boolean} isUsed - A flag indicating if the token is used in a project.
   */
  const handleDelete = (id, isUsed) => {
    // Protect the demo token from being deleted.
    if (id === DEMO_TOKEN_ID) {
      showToast('This demo token is protected and cannot be deleted.', 'warn');
      return;
    }
    
    // Set up and open the confirmation dialog.
    setDialog({
      isOpen: true,
      title: 'Delete Token',
      message: isUsed
        ? 'This token is currently in use by one or more projects. Are you sure you want to delete it?'
        : 'Are you sure you want to permanently delete this token?',
      onConfirm: () => {
        deleteTokenMutation.mutate(id);
        setDialog({ isOpen: false }); // Close dialog on confirm
      },
    });
  };

  /**
   * Handles toggling the active status of a token (enabling or disabling).
   * @param {number} id - The ID of the token.
   * @param {boolean} active - The current active status of the token.
   * @param {boolean} isUsed - A flag indicating if the token is used in a project.
   */
  const handleToggleStatus = (id, active, isUsed) => {
    // If the token is currently disabled, enable it without confirmation.
    if (!active) {
      enableTokenMutation.mutate(id);
      return;
    }

    // Before trying to disable a token, check if it's the protected one.
    if (id === DEMO_TOKEN_ID) {
      showToast('This demo token is protected and cannot be disabled.', 'warn');
      return;
    }

    // If the token is active and used by a project, ask for confirmation before disabling.
    if (isUsed) {
      setDialog({
        isOpen: true,
        title: 'Disable Token',
        message: 'This token is currently used by a project. Disabling it may cause the project to fail. Are you sure?',
        onConfirm: () => {
          disableTokenMutation.mutate(id);
          setDialog({ isOpen: false });
        },
      });
    } else {
      // If the token is active but not used, disable it without confirmation.
      disableTokenMutation.mutate(id);
    }
  };

  // --- Data Preparation ---
  // Prepare the data for the InfoTable component using the schema and attaching handlers.
  const tableData = prepareTokenTableData(tokens, {
    onDelete: handleDelete,
    onToggleStatus: handleToggleStatus,
  });

  // Define the fields for the 'Add Token' form.
  const formFields = [
    { name: 'name', placeholder: 'Token Name (e.g., My OpenAI Key)' },
    { name: 'apiKey', placeholder: 'API Key Value (e.g., sk-...)' },
  ];

  // --- Render Logic ---
  if (isLoading) return <PageWrapper title="My Tokens"><div>Loading tokens...</div></PageWrapper>;
  if (isError) return <PageWrapper title="My Tokens"><div>Failed to load tokens. Please try again later.</div></PageWrapper>;

  return (
    <PageWrapper title="My Tokens">
      <AddItemForm 
        onSubmit={handleAddToken} 
        fields={formFields} 
        buttonLabel="Add Token" 
      />
      <InfoTable 
        columns={tokenColumns} 
        data={tableData} 
        isLoading={addTokenMutation.isPending || deleteTokenMutation.isPending || disableTokenMutation.isPending || enableTokenMutation.isPending}
      />
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        onClose={() => setDialog({ isOpen: false })}
        onConfirm={dialog.onConfirm}
      >
        {dialog.message}
      </ConfirmDialog>
    </PageWrapper>
  );
};

export default TokensPage;