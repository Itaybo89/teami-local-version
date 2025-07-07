// FILE: frontend/src/main.jsx
// Purpose: The main entry point for the React application.
// This file is responsible for initializing the application, setting up context
// providers, and rendering the root <App /> component into the DOM.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';

// Import global styles and specific styles for third-party libraries.
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Create a new instance of QueryClient for managing server state.
// This client handles caching, refetching, and synchronization of data.
const queryClient = new QueryClient();

// Use the new `createRoot` API to render the application into the 'root' div in index.html.
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode is a development tool that highlights potential problems in an application.
  // It activates additional checks and warnings for its descendants.
  <React.StrictMode>
    {/* Provides the QueryClient to all components in the app, enabling data fetching hooks. */}
    <QueryClientProvider client={queryClient}>
      {/* Enables client-side routing, allowing for navigation between different pages. */}
      <BrowserRouter>
        {/* Provides authentication context (e.g., user state, login/logout functions) to the app. */}
        <AuthProvider>
          {/* The root component of the application where all pages and components are rendered. */}
          <App />
          {/* A dedicated container for displaying toast notifications throughout the application. */}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
