// FILE: src/components/createproject/AgentMembersList.jsx
// Purpose: Manages and displays a list of agents assigned to a new project.
//          It provides functionality to add new agents, update their details,
//          and remove them from the project.

import React from 'react';
import AgentMemberRow from './AgentMemberRow'; // Component for displaying and editing an individual agent's details
import styles from './CreateProject.module.css'; // Imports CSS module for styling the project creation form

/**
 * AgentMembersList component allows users to define and manage the agents
 * that will be part of a new project. It renders a list of `AgentMemberRow`
 * components and provides controls to add or remove agents, as well as
 * update their individual properties.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} props.agents - An array of agent objects, representing the current
 * list of agents assigned to the project.
 * @param {Function} props.setAgents - A state setter function to update the parent's
 * `agents` array when changes occur (add, remove, update).
 * @returns {JSX.Element} A div element containing the agent assignment section.
 */
const AgentMembersList = ({ agents, setAgents }) => {
  /**
   * Adds a new, empty agent object to the `agents` array.
   * This triggers the rendering of a new `AgentMemberRow` for the user to fill in.
   */
  const handleAddAgent = () => {
    setAgents([
      ...agents, // Keep existing agents
      {
        // Define default/empty properties for a new agent
        name: '',
        role: '',
        model: '',
        description: '',
        canMessageIds: [] // Initialize with an empty array for message permissions
      }
    ]);
  };

  /**
   * Handles changes to an individual agent's properties.
   * It updates the `agents` array in the parent component's state based on the
   * `index` of the agent, the `field` being changed, and the new `value`.
   * Special handling is included for `canMessageIds` to toggle selections.
   *
   * @param {number} index - The index of the agent in the `agents` array that is being modified.
   * @param {string} field - The name of the property to update (e.g., 'name', 'role', 'canMessageIds').
   * @param {*} value - The new value for the specified field.
   */
  const handleAgentChange = (index, field, value) => {
    const updated = [...agents]; // Create a mutable copy of the agents array

    if (field === 'canMessageIds') {
      // Special logic for 'canMessageIds' (checkboxes/multi-select)
      const exists = updated[index].canMessageIds.includes(value); // Check if the ID already exists
      updated[index].canMessageIds = exists
        ? updated[index].canMessageIds.filter((v) => v !== value) // If it exists, remove it
        : [...updated[index].canMessageIds, value]; // If not, add it
    } else {
      // For all other fields, directly update the property
      updated[index][field] = value;
    }
    setAgents(updated); // Update the parent component's state
  };

  /**
   * Removes an agent from the `agents` array at a given index.
   *
   * @param {number} index - The index of the agent to remove.
   */
  const handleRemoveAgent = (index) => {
    const updated = [...agents]; // Create a mutable copy
    updated.splice(index, 1); // Remove 1 element at the specified index
    setAgents(updated); // Update the parent component's state
  };

  return (
    <div className={styles.projectFormSection}>
      <h3>Assign Agents</h3>
      {/* Button to add a new agent row to the form */}
      <button type="button" onClick={handleAddAgent}>
        + Add Agent
      </button>

      {/* Map through the agents array to render an AgentMemberRow for each agent */}
      {agents.map((agent, index) => (
        <AgentMemberRow
          key={index} // Using index as key, consider a unique ID for more robust lists if available
          index={index}
          agent={agent}
          agents={agents} // Pass the full list of agents for 'canMessage' dropdowns
          onChange={handleAgentChange} // Pass the change handler for individual agent fields
          onRemove={() => handleRemoveAgent(index)} // Pass a function to remove this specific agent
        />
      ))}
    </div>
  );
};

export default AgentMembersList;