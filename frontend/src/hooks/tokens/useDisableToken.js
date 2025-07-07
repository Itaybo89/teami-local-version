// FILE: src/hooks/tokens/useDisableToken.js
// Purpose: A custom React Query hook for disabling an API token.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disableToken } from '../../services/tokenService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for disabling an API token.
 *
 * Disabling a token makes it inactive without permanently deleting it. This hook
 * handles the API call and automatically updates the UI upon success.
 *
 * @returns {object} The mutation object from React Query, which includes properties
 * like `mutate` (the function to trigger the action) and `isPending`.
 */
export const useDisableToken = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for disabling a token.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `disableToken` service call in the `tryCatch` utility.
     * @param {number} tokenId - The ID of the token to be disabled.
     */
    mutationFn: (tokenId) =>
      tryCatch(() => disableToken(tokenId), {
        success: 'Token disabled successfully!',
        error: 'Failed to disable token.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'tokens' query ensures the UI is automatically
     * updated to show the token's new 'disabled' status.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};
