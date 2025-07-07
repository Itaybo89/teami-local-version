// FILE: src/hooks/projects/useCreateProject.js
// Purpose: A custom React Query hook for creating a new project.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../../services/projectService';
import { tryCatch } from '../../utils/tryCatch';

/**
 * A custom hook that provides a mutation function for creating a new project.
 *
 * This hook encapsulates the API call, handles success and error notifications,
 * and automatically navigates the user to the newly created project's workspace
 * upon successful creation.
 *
 * @returns {object} The mutation object from React Query. To use it, call `mutate(projectData)`.
 */
export const useCreateProject = () => {
  // Get the query client instance to manage cache invalidation.
  const queryClient = useQueryClient();
  // Get the navigate function from React Router for redirection.
  const navigate = useNavigate();

  return useMutation({
    /**
     * The function that will be executed when the mutation is triggered.
     * It wraps the `createProject` service call in the `tryCatch` utility.
     * @param {object} projectData - The data for the new project.
     */
    mutationFn: (projectData) =>
      tryCatch(() => createProject(projectData), {
        success: 'Project created successfully!',
        error: 'Failed to create project.',
      }),

    /**
     * A callback function that runs upon a successful mutation.
     * @param {object} data - The data returned from the `createProject` API call,
     * which should be the newly created project object.
     */
    onSuccess: (data) => {
      // Invalidate the 'projects' query to refetch the list on the projects page.
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Redirect the user to the new project's workspace for a seamless experience.
      // If for some reason the returned data doesn't have an ID, it gracefully
      // falls back to navigating to the main projects list.
      navigate(data?.id ? `/projects/${data.id}` : '/projects');
    },
  });
};
