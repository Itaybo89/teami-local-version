// FILE: src/services/authService.js
// Purpose: Provides a dedicated service for all API interactions related to
//          user authentication, such as login, logout, registration, and
//          fetching the current user's profile.

import api from './api';

/**
 * Sends a login request to the backend with user credentials.
 * @param {object} credentials - The user's login credentials.
 * @param {string} credentials.email - The user's email address.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} A promise that resolves to the user's data upon successful login.
 */
export const login = async ({ email, password }) => {
  // `withCredentials: true` is crucial for sending and receiving HTTP-only cookies
  // which are used to manage the authentication session securely.
  const res = await api.post('/auth/login', { email, password }, { withCredentials: true });
  return res.data;
};

/**
 * Sends a registration request to the backend with new user details.
 * @param {object} userData - The new user's registration data.
 * @param {string} userData.username - The chosen username.
 * @param {string} userData.email - The user's email address.
 * @param {string} userData.password - The chosen password.
 * @returns {Promise<object>} A promise that resolves to the new user's data upon successful registration.
 */
export const register = async ({ username, email, password }) => {
  const res = await api.post('/auth/register', { username, email, password }, { withCredentials: true });
  return res.data;
};

/**
 * Sends a logout request to the backend to terminate the current session.
 * @returns {Promise<void>} A promise that resolves when the logout is complete.
 */
export const logout = async () => {
  // Sends the session cookie to the backend so it can be invalidated.
  await api.post('/auth/logout', {}, { withCredentials: true });
};

/**
 * Fetches the profile of the currently authenticated user.
 * This is used to verify an existing session on app load.
 * @returns {Promise<object>} A promise that resolves to the current user's data.
 */
export const getUserProfile = async () => {
  const res = await api.get('/auth/me', { withCredentials: true });
  return res.data;
};

/**
 * A convenience function to log in as a pre-configured demo user.
 * This is intended for user experience and public-facing demos. The credentials
 * used here are not considered secret.
 * @returns {Promise<object>} A promise that resolves to the demo user's data.
 */
export const loginDemoUser = async () => {
  return login({ email: 'demo@demo.com', password: 'demo123' });
};
