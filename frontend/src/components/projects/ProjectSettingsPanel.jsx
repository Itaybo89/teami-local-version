// FILE: src/components/projects/ProjectSettingsPanel.jsx
// Purpose: A reusable UI component that displays and allows modification of
//          key project settings, such as pause status, message limits, and the active token.

import React, { useEffect, useState } from 'react';
import styles from './ProjectSettingsPanel.module.css';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/toastUtils';
import { DEMO_USER_ID, DEMO_PROJECT_LIMIT } from '../../config/demoIds';

/**
 * A panel component for displaying and managing a project's settings.
 * It handles its own UI logic for demo user restrictions.
 * @param {object} props The component props.
 * @param {object} props.project The full project data object.
 * @param {Function} props.onTogglePause Callback to pause or resume the project.
 * @param {Function} props.onSetLimit Callback to set the message limit.
 * @param {object[]} props.tokens List of available active tokens.
 * @param {object} props.currentToken The currently assigned token object.
 * @param {Function} props.onSwitchToken Callback to switch the project's token.
 * @param {boolean} props.isUpdating Flag to disable controls during updates.
 * @param {boolean} props.isSnapshot Flag to indicate if the project is a read-only snapshot.
 * @returns {React.ReactElement}
 */
const ProjectSettingsPanel = ({
  project,
  onTogglePause,
  onSetLimit,
  tokens = [],
  currentToken,
  onSwitchToken,
  isUpdating = false,
  isSnapshot = false,
}) => {
  // Get the current user to check for demo status.
  const { user } = useAuth();
  
  const isDemoUser = user?.id === DEMO_USER_ID;

  const [limit, setLimit] = useState(project?.messageLimit ?? 0);

  // Sync local limit state with props to reflect external changes.
  useEffect(() => {
    if (project?.messageLimit !== undefined) {
      setLimit(project.messageLimit);
    }
  }, [project?.messageLimit]);

  const paused = project?.isPaused ?? false;
  
  /**
   * Handles the "Apply" button click for setting the message limit,
   * prioritizing the snapshot check before the demo user validation.
   */
  const handleApplyLimit = () => {
    if (isSnapshot) {
      return onSetLimit(limit);
    }

    if (isDemoUser && limit > DEMO_PROJECT_LIMIT) {
      return showToast(`Demo users cannot set a limit above ${DEMO_PROJECT_LIMIT}.`, 'warn');
    }
    
    onSetLimit(limit);
  };

  return (
    <div className={styles.panel}>
      <h3>Project Settings</h3>

      <div className={styles.setting}>
        <span>Status:</span>
        <button onClick={onTogglePause} disabled={isUpdating}>
          {isUpdating ? 'Applying...' : paused ? 'Resume Project' : 'Pause Project'}
        </button>
      </div>

      <div className={styles.setting}>
        <span>Remaining Messages:</span>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          disabled={isUpdating}
        />
        <button onClick={handleApplyLimit} disabled={isUpdating}>
          Apply
        </button>
      </div>
      
      {limit <= 0 && (
        <div className={styles.warning}>⚠️ Message limit reached. Input disabled.</div>
      )}

      <div className={styles.setting}>
        <span>Active Token:</span>
        <select
          value={currentToken?.id ?? ''}
          onChange={(e) => onSwitchToken(Number(e.target.value))}
          disabled={isUpdating}
          className={currentToken && !currentToken.isActive ? styles.tokenError : ''}
        >
          {currentToken ? (
            <option value={currentToken.id} disabled>
              Current: {currentToken.name}
            </option>
          ) : (
            <option value="" disabled>
              No token assigned
            </option>
          )}

          <option value="" disabled>--- Select New Token ---</option>

          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.name}
            </option>
          ))}
        </select>
      </div>

      {currentToken && !currentToken.isActive && (
        <div className={styles.warning}>
          ⚠️ This token is disabled. The project cannot run until an active token is selected.
        </div>
      )}

      {!currentToken && (
        <div className={styles.warning}>
          ⚠️ No token is assigned to this project.
        </div>
      )}
    </div>
  );
};

export default ProjectSettingsPanel;