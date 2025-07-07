// FILE: src/hooks/agents/useDeleteAgent.js
// Purpose: A custom React Query hook for deleting a user-created agent.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAgent } from '../../services/agentService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for deleting an agent.
 *
 * It encapsulates the API call, handles success and error notifications,
 * and automatically refetches the user's agent list upon successful deletion.
 *
 * @returns {object} The mutation object from React Query. To use it, call `mutate(agentId)`.
 */
export const useDeleteAgent = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for deleting an agent.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `deleteAgent` service call in the `tryCatch` utility.
     * @param {number | string} agentId - The ID of the agent to be deleted.
     */
    mutationFn: (agentId) =>
      tryCatch(() => deleteAgent(agentId), {
        success: 'Agent deleted successfully!',
        error: 'Failed to delete agent.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'agents' query key tells React Query that the existing
     * list of agents is now out of date and must be refetched. This causes
     * any component using the `useAgents` hook to automatically re-render
     * with the updated list.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
