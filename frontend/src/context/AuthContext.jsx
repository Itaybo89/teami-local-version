// FILE: src/context/AuthContext.js
// Purpose: Defines the authentication context and provider for the application.
// This is the central hub for managing user state, login, logout, and registration logic.

import React, { createContext, useContext } from 'react';
import { useUser } from '../hooks/auth/useUser';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../services/authService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '../utils/toastUtils';
import { useNavigate } from 'react-router-dom';

// Create a new context to hold authentication state and functions.
const AuthContext = createContext();

/**
 * A provider component that encapsulates all authentication logic and makes it
 * available to its children via the `useAuth` hook.
 *
 * It manages:
 * - Fetching the current user's profile.
 * - Handling login, registration, and logout mutations.
 * - Providing the user object and authentication status to the rest of the app.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be rendered.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Use the custom `useUser` hook to fetch the current user's profile.
  // The data from the API is nested: { user: { id: ..., email: ... } }
  const { data: nestedUser, isLoading } = useUser();

  // --- Mutations for Authentication Actions ---

  // A React Query mutation for handling user login.
  const loginMutation = useMutation({
    mutationFn: apiLogin, // The function that performs the API call.
    onSuccess: async () => {
      // On successful login, invalidate the 'user' query to refetch the user's profile.
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      showToast('Login successful!', 'success');
      // Redirect the user to the main dashboard.
      navigate('/dashboard');
    },
    onError: () => {
      // On failure, show an error toast.
      showToast('Login failed. Please check your credentials.', 'error');
    },
  });

  // A React Query mutation for handling new user registration.
  const registerMutation = useMutation({
    mutationFn: apiRegister,
    onSuccess: async () => {
      // On successful registration, refetch the user profile to log them in.
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      showToast('Account created successfully!', 'success');
      // Redirect the new user to the dashboard.
      navigate('/dashboard');
    },
    onError: () => {
      showToast('Registration failed. Please try again.', 'error');
    },
  });

  // --- Logout Function ---

  /**
   * Logs the user out by calling the API, invalidating the user query,
   * and performing a hard reload to reset all application state.
   */
  const logout = async () => {
    try {
      await apiLogout();
      showToast('Logged out successfully.', 'info');
    } catch (error) {
      // Even if the API call fails, proceed with client-side logout.
      console.error('Logout API call failed, proceeding with client-side logout.', error);
    } finally {
      // Invalidate the user query to clear the user data from the cache.
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      // A hard reload is a robust way to ensure all application state
      // (including other contexts and caches) is completely reset.
      window.location.href = '/';
    }
  };

  // --- THIS IS THE FIX ---
  // The value provided to consumer components now "unwraps" the user object.
  // This ensures that any component calling `useAuth()` gets the correct, flat user object.
  const authContextValue = {
    user: nestedUser?.user,
    isAuthenticated: !!nestedUser?.user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loading: isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * A custom hook that provides easy access to the authentication context.
 * @returns {object} The authentication context value.
 */
export const useAuth = () => useContext(AuthContext);