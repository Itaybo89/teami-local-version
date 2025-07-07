// FILE: src/components/createproject/GeneralProjectSettings.jsx
// Purpose: Renders a form section for defining the general settings of a new project,
//          including its title, description, system prompt, and associated API token.

import React from 'react';
import styles from './CreateProject.module.css'; // Imports CSS module for styling the project creation form

/**
 * GeneralProjectSettings component provides input fields for a new project's core details.
 * This includes the project's title, a brief description, a system-level prompt to guide
 * agent behavior, and a selection for an API token to be used with the project.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.title - The current value for the project's title.
 * @param {Function} props.setTitle - Callback to update the project's title.
 * @param {string} props.description - The current value for the project's description.
 * @param {Function} props.setDescription - Callback to update the project's description.
 * @param {string} props.systemPrompt - The current value for the system prompt.
 * @param {Function} props.setSystemPrompt - Callback to update the system prompt.
 * @param {number | null} props.tokenId - The ID of the currently selected API token.
 * @param {Function} props.setTokenId - Callback to update the selected API token ID.
 * @param {Array<object>} [props.availableTokens=[]] - An array of available API token objects,
 * each with at least an `id` and `name`.
 * @returns {JSX.Element} A div element containing the general project settings form fields.
 */
const GeneralProjectSettings = ({
  title,
  setTitle,
  description,
  setDescription,
  systemPrompt,
  setSystemPrompt,
  tokenId,
  setTokenId,
  availableTokens = [],
}) => {
  return (
    <div className={styles.createProjectTop}>
      {/* Left Column for Title, Token, and Info */}
      <div className={styles.leftColumn}>
        {/* Project Title Input */}
        <div className={styles.formRow}>
          <label>Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)} // Update title state on change
            required // Make this field mandatory
          />
        </div>

        {/* Token Selection Dropdown */}
        <div className={styles.formRow}>
          <label>Token</label>
          <select
            value={tokenId || ''} // Controlled component: value from state, default to empty string for placeholder
            onChange={(e) => setTokenId(Number(e.target.value) || null)} // Convert value to number, fallback to null
          >
            <option value="">Select token</option> {/* Placeholder option */}
            {availableTokens.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {/* Display token name in the dropdown */}
              </option>
            ))}
          </select>
        </div>

        {/* Informational Box */}
        <div className={`${styles.formRow} ${styles.instructionsBox}`}>
          <label>Info</label>
          <textarea
            readOnly // This textarea is for display only, not editable
            value="Title and Token are required. System prompt helps guide agent behavior." // Static instruction text
          />
        </div>
      </div>

      {/* Right Column for Description and System Prompt */}
      <div className={styles.rightColumn}>
        {/* Project Description Textarea */}
        <div className={styles.formRow}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)} // Update description state on change
            rows={3} // Set initial number of rows
          />
        </div>

        {/* System Prompt Textarea */}
        <div className={styles.formRow}>
          <label>System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)} // Update system prompt state on change
            rows={6} // Set initial number of rows
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralProjectSettings;