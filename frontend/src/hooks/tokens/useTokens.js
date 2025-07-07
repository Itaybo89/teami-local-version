// FILE: src/hooks/tokens/useTokens.js
// Purpose: A custom React Query hook for fetching the user's list of API tokens.

import { useQuery } from '@tanstack/react-query';
import { fetchTokens } from '../../services/tokenService';

/**
 * A custom hook that fetches the list of all API tokens for the current user.
 *
 * It uses React Query's `useQuery` to handle the data fetching, caching,
 * and background synchronization of the token list. This hook is the primary
 * source of token data for components like the TokensPage.
 *
 * @returns {object} The query object from React Query, which includes:
 * - `data`: The array of normalized token objects.
 * - `isLoading`: A boolean indicating if the initial fetch is in progress.
 * - `isError`: A boolean indicating if the fetch resulted in an error.
 */
export const useTokens = () => {
  // Return the query hook configured for fetching tokens.
  return useQuery({
    // `queryKey` is a unique identifier for this query. React Query uses it for caching.
    // Any other part of the app that uses this key will get the same cached data.
    queryKey: ['tokens'],

    // `queryFn` is the asynchronous function that will be executed to fetch the data.
    queryFn: fetchTokens
  });
};
