// FILE: src/schemas/agentTableSchema.js
// Purpose: Defines the schema and data preparation logic for the table that displays AI agents.
// This separates the table's structure and data transformation from the reusable table component.

import { truncateWithHover } from '../utils/truncate';

/**
 * An array defining the columns for the agents table.
 * Each object represents a column with a `key` for data mapping and a `label` for the header.
 */
export const agentColumns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'model', label: 'Model' },
  { key: 'description', label: 'Description' },
  // --- The 'Actions' column is now commented out as requested. ---
  // { key: 'actions', label: 'Actions' }
];

/**
 * A data processor function that transforms an array of raw agent objects from the API
 * into a format suitable for the generic InfoTable component.
 *
 * @param {Array<object>} agents - The array of raw agent objects.
 * @param {object} [handlers={}] - An object containing callback functions for actions (currently unused).
 * @returns {Array<object>} A new array of objects, each structured for a row in the InfoTable.
 */
export const prepareAgentTableData = (agents, handlers = {}) =>
  // Map over the raw agent data to create a new array for the table.
  agents.map(agent => ({
    // Each row needs a unique ID for React keys.
    id: agent.id,

    // The 'fields' object contains the data to be displayed in the table cells.
    // The keys here must match the 'key' properties in the `agentColumns` array.
    fields: {
      name: truncateWithHover(agent.name, 30),
      role: truncateWithHover(agent.role || '—', 20),
      model: truncateWithHover(agent.model || '', 20),
      description: truncateWithHover(agent.description || '', 50)
    },
    
    // --- The 'actions' object is now commented out to disable delete functionality. ---
    // actions: {
    //   onDelete: () => handlers.onDelete?.(agent.id)
    // }
  }));
