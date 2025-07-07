// FILE: src/components/layout/TopBar.jsx
// Purpose: Displays the application's top navigation bar, featuring the dashboard title
//          and user information including their name and avatar.

import React from 'react';
import styles from './TopBar.module.css'; // Imports CSS module for styling the top bar

/**
 * TopBar component renders the upper navigation bar of the application.
 * It prominently displays a dashboard title and user-specific information
 * such as their name and avatar.
 *
 * @param {object} props - The component's properties.
 * @param {object | null} props.user - An object containing user information,
 * typically including `name` and `avatar` properties. Can be `null` if no user is logged in.
 * @param {string} [props.user.name] - The name of the logged-in user. Defaults to 'User' if not provided.
 * @param {string} [props.user.avatar] - The URL to the user's avatar image. Defaults to '/default-avatar.png' if not provided.
 * @returns {JSX.Element} A div element representing the top navigation bar.
 */
const TopBar = ({ user }) => {
  return (
    <div className={styles.topbar}>
      {/* Application or Dashboard Title */}
      <div className={styles.title}>Tea mi Dashboard</div>

      {/* User Information Section */}
      <div className={styles.user}>
        {/* Displays the username, defaulting to 'User' if not available */}
        <span className={styles.username}>{user?.name || 'User'}</span>
        {/* Displays the user's avatar, defaulting to a placeholder image if not available */}
        <img
          src={user?.avatar || '/default-avatar.png'} // Source for the avatar image
          alt="User Avatar" // Alt text for accessibility
          className={styles.avatar} // Apply avatar-specific styling
        />
      </div>
    </div>
  );
};

export default TopBar;