// FILE: src/hooks/tokens/useAddToken.js
// Purpose: A custom React Query hook for adding a new API token.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToken } from '../../services/tokenService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for adding a new API token.
 *
 * It encapsulates the entire process of making the API call, handling
 * success and error states with toast notifications, and invalidating
 * the relevant query cache to automatically update the UI.
 *
 * @returns {object} The mutation object from React Query, which includes properties
 * like `mutate` (the function to trigger the mutation), `isPending`, etc.
 */
export const useAddToken = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for adding a token.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `addToken` service call in the `tryCatch` utility to
     * handle side effects like showing toast notifications.
     */
    mutationFn: (data) =>
      tryCatch(() => addToken(data), {
        success: 'Token added successfully!',
        error: 'Failed to add token.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'tokens' query key tells React Query that the existing
     * token data is stale and needs to be refetched. This automatically
     * updates the UI with the new list of tokens.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};
