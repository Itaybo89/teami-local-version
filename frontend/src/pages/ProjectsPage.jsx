// FILE: src/pages/ProjectsPage.jsx
// Purpose: Defines the "My Projects" page where users can view a list of their
// projects, delete them, and navigate to the workspace for a specific project.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/projects/useProjects';
import { useDeleteProject } from '../hooks/projects/useDeleteProject';

// Import reusable components
import PageWrapper from '../components/layout/PageWrapper';
import InfoTable from '../components/tables/InfoTable';
// --- FIXED: Import statement now uses curly braces for a named import ---
import { ConfirmDialog } from '../components/common/ConfirmDialog';

// Import schemas and processors for table data
import { projectColumns, prepareProjectTableData } from '../schemas/projectsTableSchema';
import { projectDropdownSchema } from '../schemas/projectsDropdownSchema';
import { processDropdownData } from '../processors/tableDataProcessor'; // Added this import for completeness

// Import utilities and config
import { DEMO_PROJECT_IDS } from '../config/demoIds';
import { showToast } from '../utils/toastUtils';

/**
 * The ProjectsPage component is responsible for rendering a table of all the user's
 * projects. It uses custom hooks to fetch and delete data, and schema files to
 * configure the table's appearance and behavior.
 */
const ProjectsPage = () => {
  // --- State and Hooks ---
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const navigate = useNavigate();

  // --- Data Fetching and Mutation Hooks ---
  const { data: projects = [], isLoading, isError } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  // --- Event Handlers ---

  /**
   * Opens the confirmation dialog before deleting a project.
   * @param {number} id - The ID of the project to delete.
   */
  const handleDelete = (id) => {
    // Protect demo projects from being deleted.
    if (DEMO_PROJECT_IDS.includes(id)) {
      showToast('This demo project is protected and cannot be deleted.', 'error');
      return;
    }

    // Set up and open the confirmation dialog.
    setDialog({
      isOpen: true,
      title: 'Delete Project',
      message: 'Are you sure you want to permanently delete this project and all its associated data?',
      onConfirm: () => {
        deleteProjectMutation.mutate(id);
        setDialog({ isOpen: false }); // Close dialog on confirm
      },
    });
  };

  /**
   * Navigates the user to the workspace for a specific project.
   * @param {number} id - The ID of the project to open.
   */
  const handleNavigate = (id) => {
    navigate(`/projects/${id}`);
  };

  // --- Data Preparation ---
  // Use the schema and processor to transform the raw project data into a format
  // suitable for the InfoTable component, attaching the appropriate event handlers.
  const tableData = prepareProjectTableData(projects, {
    onDelete: handleDelete,
    onNavigate: handleNavigate,
  });

  // Prepare the data for the expandable dropdown content within the table.
  const dropdownData = processDropdownData(projects, projectDropdownSchema);

  // --- Render Logic ---
  if (isLoading) {
    return <PageWrapper title="My Projects"><div>Loading projects...</div></PageWrapper>;
  }

  if (isError) {
    return <PageWrapper title="My Projects"><div>Failed to load projects. Please try again later.</div></PageWrapper>;
  }

  return (
    <PageWrapper title="My Projects" showCreateButton={true} createButtonLink="/projects/create" createButtonText="New Project">
      <InfoTable
        columns={projectColumns}
        data={tableData}
        dropdownData={dropdownData}
        isLoading={deleteProjectMutation.isPending}
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

export default ProjectsPage;
