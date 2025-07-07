// FILE: src/hooks/tokens/useEnableToken.js
// Purpose: A custom React Query hook for enabling an API token.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enableToken } from '../../services/tokenService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for enabling an API token.
 *
 * Enabling a token makes it active and usable in projects. This hook
 * handles the API call and automatically updates the UI upon success.
 *
 * @returns {object} The mutation object from React Query, which includes properties
 * like `mutate` (the function to trigger the action) and `isPending`.
 */
export const useEnableToken = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for enabling a token.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `enableToken` service call in the `tryCatch` utility.
     * @param {number} tokenId - The ID of the token to be enabled.
     */
    mutationFn: (tokenId) =>
      tryCatch(() => enableToken(tokenId), {
        success: 'Token enabled successfully!',
        error: 'Failed to enable token.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'tokens' query ensures the UI is automatically
     * updated to show the token's new 'active' status.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};
