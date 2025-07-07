// FILE: src/components/projects/TopNavMenu.jsx
// Purpose: A reusable navigation component that renders a set of tabs
//          for the Project Workspace page.

import React from 'react';
import styles from './TopNavMenu.module.css';

// An array defining the available tabs and their order.
const tabs = ['agents', 'logs', 'system'];

/**
 * A helper function to convert a tab's internal key (e.g., 'agents')
 * into a user-friendly display label (e.g., 'Agents').
 * @param {string} tab - The internal key of the tab.
 * @returns {string} The display label for the tab.
 */
const getLabel = (tab) => {
  switch (tab) {
    // --- FIXED: Reverted to the original shorter label to prevent layout issues ---
    case 'agents': return 'Agents';
    case 'logs': return 'System Log';
    case 'system': return 'System Message';
    default: return tab;
  }
};

/**
 * A presentational component that renders the tabbed navigation menu.
 * It receives the active tab and the function to set the active tab as props
 * from its parent component.
 *
 * @param {object} props - The component's props.
 * @param {string} props.activeTab - The key of the currently active tab.
 * @param {Function} props.setActiveTab - The state setter function to change the active tab.
 * @returns {React.ReactElement} The rendered navigation menu.
 */
const TopNavMenu = ({ activeTab, setActiveTab }) => {
  return (
    <div className={styles.topNav}>
      {tabs.map((tab) => (
        <button
          key={tab}
          // Dynamically apply the 'active' style if the current tab matches the activeTab prop.
          className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
          // When a button is clicked, call the parent's state setter with the new tab key.
          onClick={() => setActiveTab(tab)}
        >
          {getLabel(tab)}
        </button>
      ))}
    </div>
  );
};

export default TopNavMenu;
