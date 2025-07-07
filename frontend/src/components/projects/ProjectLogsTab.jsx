// FILE: src/components/projects/ProjectLogsTab.jsx
// Purpose: Displays a real-time and historical log of activities for a specific project.
//          It fetches logs using a custom hook, allows clearing them, and provides
//          different UI states for loading, errors, and empty logs.

import React from 'react';
import styles from './ProjectLogsTab.module.css'; // Import CSS module for styling
import { useProjectLogs } from '../../hooks/logs/useProjectLogs'; // Hook to fetch project-specific logs

/**
 * ProjectLogsTab component displays system and agent logs for a given project.
 * It is controlled by its parent component for actions like clearing logs.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.projectId - The unique identifier of the project for which to display logs.
 * @param {Function} props.onClearLogs - Callback function passed from the parent to handle log clearing.
 * @param {boolean} props.isClearing - Flag from the parent indicating if the clear operation is in progress.
 * @returns {JSX.Element} A div element containing the project logs display.
 */
const ProjectLogsTab = ({ projectId, onClearLogs, isClearing }) => {
  // Fetch project logs using the projectId.
  const { data: logs = [], isLoading, error } = useProjectLogs(projectId);

  return (
    <div className={styles.logsTabContainer}>
      {/* Header bar containing the "Clear Logs" button */}
      <div className={styles.headerBar}>
        <button
          onClick={onClearLogs} // Use the handler passed from the parent
          disabled={isClearing} // The button is only disabled while the clearing action is in progress.
          className={styles.clearButton}
        >
          {isClearing ? 'Clearing...' : 'Clear Logs'}
        </button>
      </div>

      {/* Main area for displaying logs */}
      <div className={styles.logsTab}>
        {isLoading ? (
          <div className={styles.placeholder}>Loading logs...</div>
        ) : error ? (
          <div className={styles.error}>Failed to load logs.</div>
        ) : logs.length === 0 ? (
          <div className={styles.placeholder}>No system logs yet.</div>
        ) : (
          <ul className={styles.logList}>
            {logs.map((log) => (
              <li key={log.id} className={styles.logItem}>
                <span className={`${styles.level} ${styles[log.level]}`}>
                  [{log.level.toUpperCase()}]
                </span>{' '}
                {log.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectLogsTab;
