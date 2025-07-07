// FILE: src/hooks/projects/useSetMessageLimit.js
// Purpose: A custom React Query hook for setting a project's message limit.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setMessageLimit } from '../../services/settingsService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for setting the message limit
 * of a specific project.
 *
 * This hook handles the API call to update the setting and then invalidates
 * the necessary queries to ensure the UI reflects the change.
 *
 * @param {number | string} projectId - The ID of the project whose limit is being set.
 * @returns {object} The mutation object from React Query. To use it, call `mutate(limitNumber)`.
 */
export const useSetMessageLimit = (projectId) => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `setMessageLimit` service call in the `tryCatch` utility.
     * @param {number} limit - The new message limit for the project.
     */
    mutationFn: (limit) =>
      tryCatch(() => setMessageLimit(projectId, limit), {
        success: 'Message limit updated successfully!',
        error: 'Failed to update message limit.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * It invalidates the queries for the specific project and the general
     * projects list to ensure all UI components have the latest data.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
