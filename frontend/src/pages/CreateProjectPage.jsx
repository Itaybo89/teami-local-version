// FILE: src/pages/CreateProjectPage.jsx
// Purpose: Defines the page for creating a new project. This component manages a
// multi-part form, handles loading project templates, and coordinates with various
// hooks to fetch necessary data and submit the new project to the backend.

import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import GeneralProjectSettings from '../components/createproject/GeneralProjectSettings';
import AgentMembersList from '../components/createproject/AgentMembersList';
import { useCreateProject } from '../hooks/projects/useCreateProject';
import { useTokens } from '../hooks/tokens/useTokens';
import { useProjects } from '../hooks/projects/useProjects';
import * as projectTemplates from '../templates/projects';
import { normalizeProjectForSubmit } from '../utils/normalize';
import styles from '../components/createproject/CreateProject.module.css';
import { DEMO_TOKEN_ID } from '../config/demoIds';

/**
 * The CreateProjectPage component provides a comprehensive UI for creating a new project.
 * It manages the state for all project fields, including title, description, system prompt,
 * API token, and the list of agents.
 */
const CreateProjectPage = () => {
  // --- State Management ---
  // State for each field in the project creation form.
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tokenId, setTokenId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [message, setMessage] = useState(''); // For status/error messages.
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');

  // --- Data Fetching and Mutation Hooks ---
  const { data: availableTokens = [] } = useTokens();
  const { data: userProjects = [] } = useProjects();
  const { mutate: createProject, isPending: isLoading } = useCreateProject({
    onSuccess: () => {
      setMessage('Project created successfully!');
      clearForm();
    },
    onError: (error) => {
      setMessage(error.message || 'Failed to create project. Please try again.');
    }
  });

  // --- FIX: Filter for active tokens ---
  // We create a memoized list of only the active tokens.
  // This list will be used throughout the component to ensure disabled tokens cannot be selected.
  const activeTokens = useMemo(() => {
    return availableTokens.filter(token => token.isActive);
  }, [availableTokens]);


  // --- Effects ---

  /**
   * An effect to automatically select a default API token when the component loads.
   * This improves user experience by pre-selecting a valid token if available.
   * --- FIX: This logic now uses the `activeTokens` list. ---
   */
  useEffect(() => {
    // Only set a default token if one isn't already selected and active tokens are available.
    if (activeTokens.length > 0 && tokenId === null) {
      // Check if the preferred demo token is active.
      const demoTokenIsActive = activeTokens.some(token => token.id === DEMO_TOKEN_ID);

      if (demoTokenIsActive) {
        setTokenId(DEMO_TOKEN_ID);
      } else {
        // Fallback to the first available ACTIVE token.
        setTokenId(activeTokens[0].id);
      }
    }
    // Update the dependency array to react to changes in the activeTokens list.
  }, [activeTokens, tokenId]);


  // --- Helper Functions ---

  /**
   * Resets all form fields to their initial state.
   * --- FIX: This now defaults to the first available ACTIVE token. ---
   */
  const clearForm = () => {
    setMessage('');
    setTitle('');
    setDescription('');
    setSystemPrompt('');
    setAgents([]);
    setTokenId(activeTokens.length > 0 ? activeTokens[0].id : '');
    setSelectedTemplateKey('');
  };

  /**
   * Loads the data from a selected project template into the form state.
   * --- FIX: This now only assigns an ACTIVE token. ---
   */
  const loadTemplate = (template) => {
    setTitle(template.title);
    setDescription(template.description);
    setSystemPrompt(template.systemPrompt);

    // Normalize agent data from the template for the AgentMembersList component.
    const allAgentIndexes = template.agents.map((_, index) => index);
    const normalizedAgents = template.agents.map((agent, index) => {
      // Ensure `canMessageIds` is a valid array of agent indexes.
      const canMessageIds = Array.isArray(agent.canMessageIds)
        ? agent.canMessageIds
        : allAgentIndexes.filter(i => i !== index);

      return {
        ...agent,
        description: agent.prompt || agent.description || '', // Use prompt as description if available.
        canMessageIds,
      };
    });
    setAgents(normalizedAgents);

    // Set a default token when loading a template, preferring an active demo token.
    const demoTokenIsActive = activeTokens.some(t => t.id === DEMO_TOKEN_ID);
    if (demoTokenIsActive) {
      setTokenId(DEMO_TOKEN_ID);
    } else if (activeTokens.length > 0) {
      setTokenId(activeTokens[0].id);
    }
  };


  // --- Event Handlers ---

  /**
   * Handles changes to the template selection dropdown.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event.
   */
  const handleTemplateChange = (event) => {
    const templateKey = event.target.value;
    setSelectedTemplateKey(templateKey);
    const selectedTemplate = projectTemplates[templateKey];
    if (selectedTemplate) {
      loadTemplate(selectedTemplate);
    }
  };

  /**
   * Handles the main form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages.

    // --- Client-Side Validation ---
    const existingTitles = userProjects.map(p => p.title.toLowerCase());
    if (existingTitles.includes(title.trim().toLowerCase())) {
      setMessage('A project with this title already exists. Please choose a different name.');
      return;
    }
    if (!tokenId) {
      setMessage('Please select an API token before creating the project.');
      return;
    }

    // Normalize the form data into a clean payload for the API.
    const payload = normalizeProjectForSubmit({
      title,
      description,
      systemPrompt,
      tokenId,
      agents
    });

    createProject(payload);
  };


  // --- Render Logic ---
  return (
    <PageWrapper title="Create New Project">
      {/* Template selection UI */}
      <div className={styles.templateControlBox}>
        <p>
          <span className={styles.highlightText}>Need inspiration?</span> Load a template to see an example setup, or build a new one from scratch. Our creative pick is the <span className={styles.creativePick}>Whispering Woods Chronicle</span>.
        </p>
        <div className={styles.templateActions}>
          <select
            onChange={handleTemplateChange}
            className={styles.templateDropdown}
            value={selectedTemplateKey} 
          >
            <option value="">--- Load a Template ---</option>
            {Object.entries(projectTemplates).map(([key, template]) => (
              <option key={key} value={key}>
                {template.title}
              </option>
            ))}
          </select>
          <button type="button" onClick={clearForm} className={styles.clearButton}>
            Clear Fields
          </button>
        </div>
      </div>

      {/* Main project creation form */}
      <form className={styles.createProjectForm} onSubmit={handleSubmit}>
        <div>
          <GeneralProjectSettings
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            tokenId={tokenId}
            setTokenId={setTokenId}
            // --- FIX: Pass the filtered list of active tokens to the settings component. ---
            availableTokens={activeTokens}
          />
          <AgentMembersList
            agents={agents}
            setAgents={setAgents}
          />
        </div>
        <button type="submit" disabled={!title || agents.length === 0 || isLoading}>
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
        {message && <p className={styles.statusMessage}>{message}</p>}
      </form>
    </PageWrapper>
  );
};

export default CreateProjectPage;
