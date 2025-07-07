// FILE: src/hooks/agents/useAgents.js
// Purpose: A custom React Query hook for fetching the user's list of all created agents.

import { useQuery } from '@tanstack/react-query';
import { fetchAgents } from '../../services/agentService';

/**
 * A custom hook that fetches the list of all agents for the current user.
 *
 * It uses React Query's `useQuery` to handle all the complexities of data fetching,
 * including caching, background refetching, and managing loading/error states.
 *
 * @returns {object} The query object from React Query, which includes:
 * - `data`: The array of normalized agent objects.
 * - `isLoading`: A boolean indicating if the initial fetch is in progress.
 * - `isError`: A boolean indicating if the fetch resulted in an error.
 */
export const useAgents = () => {
  return useQuery({
    // `queryKey` is a unique identifier used by React Query for caching.
    // Any component calling `useAgents()` will receive the same cached data,
    // preventing duplicate API calls.
    queryKey: ['agents'],

    // `queryFn` is the asynchronous function that performs the data fetch.
    // The `fetchAgents` service function already normalizes the data,
    // so no `select` transformation is needed here.
    queryFn: fetchAgents,
  });
};
