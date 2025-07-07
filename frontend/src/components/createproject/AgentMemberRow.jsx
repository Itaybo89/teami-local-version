// FILE: src/components/createproject/AgentMemberRow.jsx
// Purpose: Renders a single row for defining an agent's details within the project creation form.
//          This includes fields for name, role, model, description, and
//          checkboxes to specify which other agents it can message.

import React from 'react';
import styles from './CreateProject.module.css'; // Imports CSS module for styling the project creation form

/**
 * AgentMemberRow component displays and allows editing of an individual agent's
 * properties within the "Create Project" form. It includes input fields for
 * core details, a removal button, and a dynamic list of checkboxes to
 * configure which other agents this agent can communicate with.
 *
 * @param {object} props - The component's properties.
 * @param {number} props.index - The numerical index of this agent in the parent's agents array.
 * @param {object} props.agent - The agent object representing the current agent's details.
 * @param {Array<object>} props.agents - The full array of all agents currently being defined for the project.
 * This is used to display names for the "Can message" options.
 * @param {Function} props.onChange - Callback function to update a field of this agent in the parent's state.
 * It receives `(index, fieldName, value)`.
 * @param {Function} props.onRemove - Callback function to remove this agent row from the parent's state.
 * @returns {JSX.Element} A div element representing a single editable agent row.
 */
const AgentMemberRow = ({ index, agent, agents, onChange, onRemove }) => {
  // Filters the `agents` array to get the indices of all *other* agents
  // (i.e., not the current agent), to be used for the 'Can message' options.
  const otherAgents = agents
    .map((_, i) => (i !== index ? i : null)) // Map all indices, mark current agent's index as null
    .filter((i) => i !== null); // Remove the null entries

  /**
   * A helper function to simplify calling the parent's `onChange` handler.
   * It pre-fills the `index` argument.
   * @param {string} field - The name of the agent property to update.
   * @param {*} value - The new value for the property.
   */
  const handleFieldChange = (field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className={styles.agentRow}>
      {/* Top section of the agent row: Name, Role, Model inputs and Remove button */}
      <div className={styles.rowTop}>
        {/* Input for Agent Name */}
        <input
          type="text"
          placeholder="Name"
          value={agent.name}
          onChange={(e) => handleFieldChange('name', e.target.value)} // Update 'name' field
        />
        {/* Input for Agent Role */}
        <input
          type="text"
          placeholder="Role"
          value={agent.role}
          onChange={(e) => handleFieldChange('role', e.target.value)} // Update 'role' field
        />
        {/* Input for Agent Model */}
        <input
          type="text"
          placeholder="Model (e.g., gpt-4)"
          value={agent.model}
          onChange={(e) => handleFieldChange('model', e.target.value)} // Update 'model' field
        />

        {/* Button to remove this agent row */}
        <button
          type="button"
          className={styles.removeAgentBtn}
          onClick={onRemove} // Calls the parent's onRemove handler for this row
        >
          ✖ {/* Unicode multiplication sign for a close/remove icon */}
        </button>
      </div>

      {/* "Can message" list: only renders if there are other agents to message */}
      {otherAgents.length > 0 && (
        <div className={styles.canMessageList}>
          <label>Can message:</label>
          {/* Map through 'otherAgents' indices to create checkboxes for messaging permissions */}
          {otherAgents.map((i) => (
            <label key={i}>
              <input
                type="checkbox"
                // Checkbox is checked if this agent's `canMessageIds` array includes the other agent's index
                checked={agent.canMessageIds.includes(i)}
                // On change, toggle the other agent's index in `canMessageIds` array
                onChange={() => handleFieldChange('canMessageIds', i)}
              />
              {/* Display the other agent's name or a generic "Agent X" if name is empty */}
              {agents[i].name || `Agent ${i + 1}`}
            </label>
          ))}
        </div>
      )}

      {/* Textarea for Agent Description/Personality/Instructions */}
      <textarea
        placeholder="Agent description / personality / instructions"
        value={agent.description}
        onChange={(e) => handleFieldChange('description', e.target.value)} // Update 'description' field
      />
    </div>
  );
};

export default AgentMemberRow;