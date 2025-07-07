// FILE: src/hooks/messages/useSendMessage.js
// Purpose: A custom React Query hook for sending a new message to a conversation.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../../services/messageService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for sending a message.
 *
 * This hook encapsulates the API call, handles success and error notifications,
 * and invalidates the necessary queries to trigger UI updates for both the
 * message list and the overall project state.
 *
 * @param {number | string} conversationId - The ID of the conversation to send the message to.
 * @param {number | string} projectId - The ID of the parent project.
 * @returns {object} The mutation object from React Query. To use it, call `mutate(messageText)`.
 */
export const useSendMessage = (conversationId, projectId) => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `sendMessage` service call in the `tryCatch` utility.
     * @param {string} text - The content of the message to be sent.
     */
    mutationFn: (text) =>
      tryCatch(() => sendMessage(conversationId, text), {
        success: 'Message sent',
        error: 'Failed to send message',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     */
    onSuccess: () => {
      // Invalidate the query for this specific conversation's messages,
      // which will trigger a refetch and display the new message.
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });

      // Also invalidate the parent project's query. This is important for
      // updating project-level information that might change when a message
      // is sent, such as the `last_activity_at` timestamp.
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
