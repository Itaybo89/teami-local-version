// FILE: src/processors/tableDataProcessor.js
// Purpose: Provides generic data processing functions that transform API data into
//          a standardized format required by reusable UI components like tables and dropdowns,
//          using a schema-driven approach.

/**
 * A generic function to process an array of data for a standard table component.
 * It uses a provided schema to map and format fields and attach action handlers.
 *
 * @param {Array<object>} [data=[]] - The array of raw data items from an API.
 * @param {object} [schema={}] - A schema object defining how to process the fields.
 * @param {object} [schema.fields] - An object where keys match column keys and values are
 * formatter functions that take a data item and return the display value.
 * @param {object} [handlers={}] - An object containing callback functions for row actions.
 * @returns {Array<object>} A new array of objects, each formatted for a table row.
 */
export const processTableData = (data = [], schema = {}, handlers = {}) => {
  if (!schema.fields) return []; // Guard against invalid schema

  return data.map(item => ({
    // Each processed item must have a unique ID for React's key prop.
    id: item.id,

    // Use the schema's field formatters to build the 'fields' object for display.
    fields: Object.keys(schema.fields).reduce((acc, key) => {
      // For each field defined in the schema, call its formatter function with the current item.
      acc[key] = schema.fields[key](item);
      return acc;
    }, {}),

    // Attach action handlers, making them safe to call even if they weren't provided.
    actions: {
      onDelete: handlers.onDelete ? () => handlers.onDelete(item.id) : undefined,
      onToggleStatus: handlers.onToggleStatus ? () => handlers.onToggleStatus(item.id, item.isActive) : undefined,
      onOpen: handlers.onOpen ? () => handlers.onOpen(item.id) : undefined,
      // Pass through any other relevant state for the action buttons.
      isActive: item.isActive || false
    }
  }));
};


/**
 * A generic function to process an array of data for an expandable dropdown component.
 * It uses a provided schema to extract the dropdown's content and column headers.
 *
 * @param {Array<object>} [data=[]] - The array of raw data items.
 * @param {object} [dropdownSchema={}] - A schema object for the dropdown.
 * @param {Function} [dropdownSchema.getContent] - A function that takes a data item and
 * returns the array of content rows for the dropdown.
 * @param {Array<string>} [dropdownSchema.columns] - An array of column header labels.
 * @returns {Array<object>} A new array of objects, each formatted for a dropdown row.
 */
export const processDropdownData = (data = [], dropdownSchema = {}) => {
  if (!dropdownSchema.getContent) return []; // Guard against invalid schema

  return data.map(item => ({
    // The main content to be displayed within the dropdown, as defined by the schema.
    content: dropdownSchema.getContent(item),
    // The column headers for the dropdown's content.
    columns: dropdownSchema.columns || []
  }));
};
