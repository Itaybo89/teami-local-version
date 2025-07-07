// FILE: src/components/layout/Sidebar.jsx
// Purpose: Renders the main navigation sidebar for the application, providing links
//          to different sections like Dashboard, Projects, Agents, and Tokens,
//          along with a logout button. It also handles redirection if the user
//          is not authenticated.

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { useAuth } from '../../context/AuthContext'; // Imports authentication context to access user and logout function
import styles from './Sidebar.module.css'; // Imports CSS module for sidebar styling

/**
 * Sidebar component provides the main navigation for the application.
 * It displays links to various sections and includes a logout button.
 * This component relies on the AuthContext for authentication status and logout functionality,
 * and will redirect unauthenticated users to the login page.
 *
 * @returns {JSX.Element} A div element representing the application sidebar.
 */
const Sidebar = () => {
  // Hook to programmatically navigate between routes.
  const navigate = useNavigate();
  // Destructure `logout` function, `user` object, and `isAuthenticated` status from AuthContext.
  const { logout, user, isAuthenticated } = useAuth(); // `user` is imported but not used directly in this component's JSX.

  // --- Authentication Check and Redirection ---
  // This effect hook runs when `isAuthenticated` or `Maps` changes.
  useEffect(() => {
    // If the user is not authenticated, redirect them to the login page ('/').
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]); // Dependencies array ensures effect re-runs if these values change.

  return (
    <div className={styles.sidebar}>
      {/* Navigation Menu */}
      <div className={styles.menu}>
        {/* Button to navigate to the Dashboard/Profile page */}
        <button onClick={() => navigate('/profile')}>Dashboard</button>
        {/* Button to navigate to the Projects listing page */}
        <button onClick={() => navigate('/projects')}>Projects</button>
        {/* Button to navigate to the Create Project page */}
        <button onClick={() => navigate('/projects/create')}>+ Create Project</button>
        {/* Button to navigate to the Agents management page */}
        <button onClick={() => navigate('/agents')}>Agents</button>
        {/* Button to navigate to the API Tokens management page */}
        <button onClick={() => navigate('/tokens')}>Tokens</button>
      </div>
      {/* Logout Button */}
      <button className={styles.logout} onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;