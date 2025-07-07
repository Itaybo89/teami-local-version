// FILE: src/hooks/agents/useAddAgent.js
// Purpose: A custom React Query hook for creating a new agent.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAgent } from '../../services/agentService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for creating a new agent.
 *
 * It encapsulates the API call, handles success and error notifications,
 * and automatically refetches the user's agent list upon successful creation.
 *
 * @returns {object} The mutation object from React Query. To use it, call `mutate(agentData)`.
 */
export const useAddAgent = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for adding a new agent.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `addAgent` service call in the `tryCatch` utility.
     * @param {object} agent - The data for the new agent (e.g., { name, role, description, model }).
     */
    mutationFn: (agent) =>
      tryCatch(() => addAgent(agent), {
        success: 'Agent created successfully!',
        error: 'Failed to create agent.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'agents' query key tells React Query that the existing
     * list of agents is out of date and must be refetched. This will cause any
     * component using the `useAgents` hook to automatically re-render with the
     * newly created agent included in the list.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};
