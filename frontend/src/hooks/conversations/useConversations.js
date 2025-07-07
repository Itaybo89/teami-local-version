// FILE: src/hooks/conversations/useConversations.js
// Purpose: A custom React Query hook for fetching all conversations for a specific project.

import { useQuery } from '@tanstack/react-query';
import { fetchConversations } from '../../services/conversationService';

/**
 * A custom hook that fetches the list of all conversations for a given project.
 *
 * It uses React Query's `useQuery` to handle data fetching, caching, and
 * background synchronization of the conversation list.
 *
 * @param {number | string | null | undefined} projectId - The ID of the project for which to fetch conversations.
 * @returns {object} The query object from React Query, which includes `data` (the array
 * of normalized conversations), `isLoading`, `isError`, etc.
 */
export const useConversations = (projectId) => {
  return useQuery({
    // The `queryKey` includes the `projectId` to ensure that conversations for each
    // project are cached independently.
    queryKey: ['conversations', projectId],

    // The `queryFn` is the function that performs the asynchronous data fetch.
    queryFn: () => fetchConversations(projectId),

    // This query will only execute if `projectId` is a truthy value, preventing
    // API calls with an invalid ID when the component first mounts.
    enabled: !!projectId,
  });
};
