// FILE: src/hooks/auth/useUser.js
// Purpose: A custom React Query hook for fetching the currently authenticated user's profile.

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../services/authService';

/**
 * A custom hook that fetches the profile of the currently authenticated user.
 *
 * This hook is typically used at the application's root (e.g., in AuthContext)
 * to determine if a user has an active session. It includes specific configurations
 * for handling authentication-related data fetching.
 *
 * @returns {object} The query object from React Query, which includes `data`
 * (the user object), `isLoading`, `isError`, etc.
 */
export const useUser = () => {
  return useQuery({
    // The query key for the global user object.
    queryKey: ['user'],

    // The function that performs the API call to fetch the user's profile.
    queryFn: getUserProfile,

    // This is a critical setting for authentication checks. Setting `retry` to false
    // prevents React Query from making multiple attempts to fetch the user if the
    // first request fails (e.g., with a 401 Unauthorized error). This avoids
    // unnecessary network traffic for unauthenticated users.
    retry: false,

    // `staleTime` determines how long fetched data is considered "fresh". By setting
    // it to 5 minutes, we prevent React Query from automatically refetching the user
    // profile on events like window refocus for that duration. This is a good
    // optimization as user profile data rarely changes.
    staleTime: 5 * 60 * 1000,
  });
};
