// FILE: src/hooks/projects/useSwitchProjectToken.js
// Purpose: A custom React Query hook for switching a project's active API token.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { switchToken } from '../../services/settingsService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for switching the API token
 * assigned to a specific project.
 *
 * This hook handles the API call to update the setting and then invalidates
 * the necessary queries to ensure the UI reflects the change.
 *
 * @param {number | string} projectId - The ID of the project whose token is being switched.
 * @returns {object} The mutation object from React Query. To use it, call `mutate(tokenId)`.
 */
export const useSwitchProjectToken = (projectId) => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `switchToken` service call in the `tryCatch` utility.
     * @param {number} tokenId - The ID of the new token to assign to the project.
     */
    mutationFn: (tokenId) =>
      tryCatch(() => switchToken(projectId, tokenId), {
        success: 'Token switched successfully!',
        error: 'Failed to switch token.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * It invalidates two queries:
     * 1. `['project', projectId]`: To refetch the data for the specific project view.
     * 2. `['projects']`: To update the list of all projects, in case token info is displayed there.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
