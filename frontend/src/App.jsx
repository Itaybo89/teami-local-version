// FILE: src/App.jsx
// Purpose: Defines the root component of the application, which includes the
// main routing logic for all pages and handles authentication-based redirects.

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Import all page components that will be used as route destinations.
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AgentsPage from './pages/AgentsPage';
import TokensPage from './pages/TokensPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectWorkspace from './pages/ProjectWorkspace';
import CreateProjectPage from './pages/CreateProjectPage';

// Import the main layout component that wraps authenticated pages.
import Layout from './components/layout/Layout';

/**
 * The main application component responsible for rendering the correct page
 * based on the current URL and user authentication state.
 */
const App = () => {
  // Use the custom authentication hook to get the user's auth state and loading status.
  const { isAuthenticated, loading } = useAuth();

  // Display a simple loading message while the authentication status is being determined.
  // This prevents a flicker of content before the initial auth check is complete.
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    // The <Routes> component manages all the individual routes.
    <Routes>
      {/* --- Public / Redirect Routes --- */}
      {/* The root path redirects authenticated users to the dashboard, otherwise shows the Home page. */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />

      {/* --- Protected Routes --- */}
      {/* These routes are only accessible to authenticated users. If a user is not authenticated,
          they will be redirected to the root path ('/'). Authenticated views are wrapped in
          the <Layout> component which provides the standard sidebar and top bar. */}
      <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/" />} />
      <Route path="/agents" element={isAuthenticated ? <Layout><AgentsPage /></Layout> : <Navigate to="/" />} />
      <Route path="/tokens" element={isAuthenticated ? <Layout><TokensPage /></Layout> : <Navigate to="/" />} />
      <Route path="/projects" element={isAuthenticated ? <Layout><ProjectsPage /></Layout> : <Navigate to="/" />} />
      <Route path="/projects/create" element={isAuthenticated ? <Layout><CreateProjectPage /></Layout> : <Navigate to="/" />} />
      
      {/* This route for a specific project workspace is unique because it requires a WebSocket connection.
          The <SocketProvider> is placed here to ensure that the WebSocket context is only active
          for this specific part of the application, optimizing resource usage. */}
      <Route 
        path="/projects/:id" 
        element={
          isAuthenticated ? (
            <SocketProvider>
              <Layout>
                <ProjectWorkspace />
              </Layout>
            </SocketProvider>
          ) : (
            <Navigate to="/" />
          )
        } 
      />
      
      {/* --- Catch-all Route --- */}
      {/* This wildcard route handles any paths that don't match the routes above.
          It redirects users to their respective default pages based on their auth status. */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
    </Routes>
  );
};

export default App;
