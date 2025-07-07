// FILE: src/hooks/tokens/useDeleteToken.js
// Purpose: A custom React Query hook for deleting an API token.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteToken } from '../../services/tokenService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for deleting an API token.
 *
 * It encapsulates the API call, handles success and error notifications,
 * and automatically refetches the user's token list upon successful deletion.
 *
 * @returns {object} The mutation object from React Query, which includes properties
 * like `mutate` (the function to trigger the deletion) and `isPending`.
 */
export const useDeleteToken = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  // Return the mutation hook configured for deleting a token.
  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `deleteToken` service call in the `tryCatch` utility.
     * @param {number} tokenId - The ID of the token to be deleted.
     */
    mutationFn: (tokenId) =>
      tryCatch(() => deleteToken(tokenId), {
        success: 'Token deleted successfully!',
        error: 'Failed to delete token.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'tokens' query ensures the UI is automatically
     * updated to reflect the removal of the token.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });
};
