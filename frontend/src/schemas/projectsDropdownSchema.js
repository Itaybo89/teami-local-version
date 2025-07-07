// FILE: src/schemas/projectsDropdownSchema.js
// Purpose: Defines the schema for displaying a project's agent list within an
//          expandable dropdown component, likely on the Projects page.

import { truncateWithHover } from '../utils/truncate';

/**
 * An object that defines how to extract and display data for a project dropdown.
 * This schema is used to configure a generic dropdown component to show a
 * project's associated agents in a structured way.
 */
export const projectDropdownSchema = {
  /**
   * A function that takes a raw project object and returns a formatted array
   * of content to be displayed in the dropdown rows.
   * @param {object} project - The full project object from the API.
   * @returns {Array<object>} An array of objects, each representing an agent
   * with formatted `name` and `role` properties.
   */
  getContent: (project) => project.agents?.map(agent => ({
    name: truncateWithHover(agent.name, 50), // Truncate agent name for a clean UI.
    role: truncateWithHover(agent.role || '—', 50) // Use a dash for missing roles.
  })) || [], // Gracefully handle cases where there are no agents.

  /**
   * An array of strings that defines the header labels for the columns
   * in the dropdown's content area.
   */
  columns: ['Name', 'Role']
};
