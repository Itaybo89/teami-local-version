// FILE: src/hooks/messages/useFilteredMessages.js
// Purpose: A custom React Query hook for fetching and then filtering messages
//          for a specific conversation based on a provided filter function.

import { useQuery } from '@tanstack/react-query';
import { fetchMessages } from '../../services/messageService';
import { normalizeMessage } from '../../utils/normalize';

/**
 * A custom hook that fetches messages for a conversation and applies a filter function.
 *
 * This hook is powerful because it fetches the full, unfiltered list of messages and
 * caches it under `['messages', conversationId]`. The `select` option then allows
 * this hook to return a transformed (filtered) version of that data without needing
 * a separate API call or a different cache key.
 *
 * @param {number | string | null | undefined} conversationId - The ID of the conversation to fetch.
 * @param {Function} filterFn - A function that receives a normalized message and returns
 * `true` to include it in the final result, or `false` to exclude it.
 * @returns {object} The query object from React Query, where `data` will be the filtered
 * array of messages.
 */
export const useFilteredMessages = (conversationId, filterFn) => {
  return useQuery({
    // The query key for fetching the raw, unfiltered message data.
    queryKey: ['messages', conversationId],

    // The function that fetches the raw data from the API.
    queryFn: () => fetchMessages(conversationId),

    // Only run this query if a valid `conversationId` is provided.
    enabled: !!conversationId,

    /**
     * The `select` option is a powerful transformer. It receives the raw data
     * fetched by `queryFn` and allows you to return a modified version.
     * React Query will memoize the result of this function, so the filtering
     * only re-runs if the source data or the filter function changes.
     * @param {Array<object>} messages - The raw array of message objects from the API.
     * @returns {Array<object>} The filtered array of normalized messages.
     */
    select: (messages) => messages.map(normalizeMessage).filter(filterFn),
  });
};
