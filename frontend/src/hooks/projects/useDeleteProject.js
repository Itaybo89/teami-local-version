// FILE: src/hooks/projects/useDeleteProject.js
// Purpose: A custom React Query hook for deleting a project.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProject } from '../../services/projectService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for deleting a project.
 *
 * This hook encapsulates the API call to delete a project and handles
 * UI feedback and cache invalidation automatically.
 *
 * @returns {object} The mutation object from React Query. To use it, call `mutate(projectId)`.
 */
export const useDeleteProject = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `deleteProject` service call in the `tryCatch` utility.
     * @param {number | string} projectId - The ID of the project to delete.
     */
    mutationFn: (projectId) =>
      tryCatch(() => deleteProject(projectId), {
        success: 'Project deleted successfully!',
        error: 'Failed to delete project.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating the 'projects' query key tells React Query that the list of
     * projects is now out of date and must be refetched. This will cause the
     * UI to automatically update and remove the deleted project.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
