// FILE: src/hooks/projects/useProject.js
// Purpose: A custom React Query hook for fetching a single project by its ID.

import { useQuery } from '@tanstack/react-query';
import { fetchProjectById } from '../../services/projectService';

/**
 * A custom hook that fetches a single project by its unique ID.
 *
 * It uses React Query's `useQuery` to handle data fetching for a specific project.
 * The hook is "enabled" only when a valid projectId is provided, preventing
 * unnecessary API calls on initial render.
 *
 * @param {number | string | null | undefined} projectId - The ID of the project to fetch.
 * @returns {object} The query object from React Query, which includes `data`, `isLoading`, `isError`, etc.
 */
export const useProject = (projectId) => {
  return useQuery({
    // The `queryKey` includes the `projectId` to ensure that each project is cached
    // separately. Changing the `projectId` will automatically trigger a new fetch.
    queryKey: ['project', projectId],

    // The `queryFn` is wrapped in an arrow function to pass the `projectId`
    // to the `fetchProjectById` service function.
    queryFn: () => fetchProjectById(projectId), 

    // This is a crucial optimization. The `enabled` option tells React Query
    // to only run this query if `projectId` is a truthy value (i.e., not null,
    // undefined, or 0). This prevents the hook from making an API call with an
    // invalid ID when the component first mounts.
    enabled: !!projectId,
  });
};
