// FILE: src/hooks/projects/usePauseProject.js
// Purpose: A custom React Query hook for pausing or resuming a project.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProjectStatus } from '../../services/projectService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for pausing or resuming a project.
 *
 * This hook encapsulates the API call to update the project's status and handles
 * UI feedback and cache invalidation automatically.
 *
 * @param {number | string} projectId - The ID of the project to pause or resume.
 * @returns {object} The mutation object from React Query. To use it, call `mutate(isPausedBoolean)`.
 * For example, `mutate(true)` will pause the project.
 */
export const usePauseProject = (projectId) => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It calls the `updateProjectStatus` service function.
     * @param {boolean} paused - The new paused state for the project.
     */
    mutationFn: (paused) =>
      tryCatch(() => updateProjectStatus(projectId, paused), {
        // The success message is dynamically set based on the action taken.
        success: paused ? 'Project paused successfully' : 'Project resumed successfully',
        error: 'Failed to update project status',
      }),
    
    /**
     * A callback function that runs upon a successful mutation.
     * Invalidating both the specific project query and the general projects list
     * ensures that the UI is consistently updated everywhere.
     */
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
