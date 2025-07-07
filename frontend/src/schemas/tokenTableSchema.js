// FILE: src/schemas/tokenTableSchema.js
// Purpose: Defines the schema and data preparation logic for the table that displays API tokens.
// This approach separates the table's structure and data transformation from the reusable
// table component itself.

import { truncateWithHover } from '../utils/truncate';

/**
 * An array defining the columns for the tokens table.
 * Each object represents a column with a `key` for data mapping and a `label` for the header.
 */
export const tokenColumns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' } // A special column for interactive buttons.
];

/**
 * A data processor function that transforms an array of raw token objects from the API
 * into a format suitable for the generic InfoTable component.
 *
 * @param {Array<object>} tokens - The array of raw token objects.
 * @param {object} [handlers={}] - An object containing callback functions for actions.
 * @param {Function} [handlers.onDelete] - The function to call when a token's delete button is clicked.
 * @param {Function} [handlers.onToggleStatus] - The function to call when a token's enable/disable button is clicked.
 * @returns {Array<object>} A new array of objects, each structured for a row in the InfoTable.
 */
export const prepareTokenTableData = (tokens, handlers = {}) =>
  // Map over the raw token data to create a new array for the table.
  tokens.map((token) => ({
    // Each row needs a unique ID for React keys and data handling.
    id: token.id,

    // The 'fields' object contains the data to be displayed in the table cells.
    // The keys here must match the 'key' properties in the `tokenColumns` array.
    fields: {
      name: truncateWithHover(token.name, 30), // Truncate long names for a clean UI.
      // --- FIXED: Use the normalized 'isActive' property ---
      status: token.isActive ? 'Active' : 'Disabled'
    },
    
    // The 'actions' object passes data and callbacks to the action buttons in the last column.
    actions: {
      // --- FIXED: Use the normalized 'isActive' property ---
      isActive: token.isActive,
      // Pass the necessary token details up to the parent component's handler function.
      onDelete: () => handlers.onDelete?.(token.id, token.is_used),
      // --- FIXED: Pass the correct 'isActive' status to the handler ---
      onToggleStatus: () => handlers.onToggleStatus?.(token.id, token.isActive, token.is_used)
    }
  }));