// FILE: src/schemas/projectsTableSchema.js
// Purpose: Defines the schema and data preparation logic for the table that displays projects.
// This separates the table's structure and data transformation from the reusable table component.

import { truncateWithHover } from '../utils/truncate';
import { formatTime } from '../utils/formatUtils'; // Assuming a date/time formatter exists

/**
 * An array defining the columns for the projects table.
 * Each object represents a column with a `key` for data mapping and a `label` for the header.
 */
export const projectColumns = [
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'actions', label: 'Actions' } // A special column for interactive buttons.
];

/**
 * A data processor function that transforms an array of raw project objects from the API
 * into a format suitable for the generic InfoTable component.
 *
 * @param {Array<object>} projects - The array of raw project objects.
 * @param {object} [handlers={}] - An object containing callback functions for actions.
 * @param {Function} [handlers.onDelete] - The function to call when a project's delete button is clicked.
 * @param {Function} [handlers.onNavigate] - The function to call to navigate to the project's workspace.
 * @returns {Array<object>} A new array of objects, each structured for a row in the InfoTable.
 */
export const prepareProjectTableData = (projects, handlers = {}) =>
  // Map over the raw project data to create a new array for the table.
  projects.map((project) => ({
    // Each row needs a unique ID for React keys and data handling.
    id: project.id,

    // The 'fields' object contains the data to be displayed in the table cells.
    // The keys here must match the 'key' properties in the `projectColumns` array.
    fields: {
      title: truncateWithHover(project.title, 30),
      description: truncateWithHover(project.description || '', 50),
      status: project.isPaused ? 'Paused' : 'Active',
      createdAt: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'
    },
    
    // The 'actions' object passes data and callbacks to the action buttons in the last column.
    actions: {
      // --- FIX: This line is added ---
      // Provides the boolean needed by the InfoTable's Badge component to set the correct color.
      isActive: !project.isPaused,
      
      // Pass the project ID up to the parent component's handler functions.
      onDelete: () => handlers.onDelete?.(project.id),
      onNavigate: () => handlers.onNavigate?.(project.id)
    }
  }));