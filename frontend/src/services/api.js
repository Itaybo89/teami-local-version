// FILE: src/services/api.js
// Purpose: Creates and configures a centralized Axios instance for making
//          all HTTP requests to the backend API.

import axios from 'axios';

// Create a new Axios instance with default configurations.
// Using a centralized instance like this allows for easy management of
// base URLs, headers, and other settings across the entire application.
const api = axios.create({
  // Sets the base URL for all API requests. Any relative paths used in
  // other service files (e.g., '/auth/login') will be prefixed with this URL.
  // Note: For production, this URL should be loaded from an environment variable.
  baseURL: 'http://localhost:5000/api',

  // This crucial setting ensures that cookies (like the authentication session
  // cookie) are sent with every request from the frontend to the backend.
  // This is required for session-based authentication to work correctly.
  withCredentials: true
});

export default api;
