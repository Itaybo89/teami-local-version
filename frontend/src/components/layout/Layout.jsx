// FILE: src/components/layout/Layout.jsx
// Purpose: Defines the overall structural layout for the application,
//          combining the sidebar, top navigation bar, and a content area
//          where specific pages will be rendered.

import React from 'react';
import Sidebar from './Sidebar';   // Imports the Sidebar component for left navigation
import TopBar from './TopBar';     // Imports the TopBar component for top navigation
import '../../styles/layout.css'; // Imports global layout styles

// A mock user object used for demonstration purposes.
// In a real application, this data would come from an authentication context or API.
const mockUser = {
  name: 'I.T.', // Display name for the mock user
  avatar: '/default-avatar.png', // Path to the mock user's avatar image
};

/**
 * Layout component serves as the main structural wrapper for the application.
 * It integrates the `Sidebar` and `TopBar` into a consistent shell,
 * and renders its `children` within the main content area.
 *
 * @param {object} props - The component's properties.
 * @param {React.ReactNode} props.children - The child components or elements
 * (e.g., specific page content wrapped by `PageWrapper`) to be rendered
 * within the main content area of the layout.
 * @returns {JSX.Element} A div element representing the complete application layout.
 */
const Layout = ({ children }) => {
  return (
    // The root container for the entire application layout.
    <div className="layout-root">
      {/* Renders the Sidebar component for primary navigation */}
      <Sidebar />
      {/* Container for the main content area, positioned next to the sidebar */}
      <div className="layout-content">
        {/* Renders the TopBar component, passing the mock user data */}
        <TopBar user={mockUser} />
        {/*
          This is where the actual page-specific content will be rendered.
          Typically, this would be a <PageWrapper> component containing the
          content of the current route.
        */}
        {children}
      </div>
    </div>
  );
};

export default Layout;