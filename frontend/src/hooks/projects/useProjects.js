// FILE: src/hooks/projects/useProjects.js
// Purpose: A custom React Query hook for fetching the user's list of all projects.

import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../../services/projectService';

/**
 * A custom hook that fetches the list of all projects for the current user.
 *
 * It uses React Query's `useQuery` to handle data fetching, caching,
 * background refetching, and other complex state management related to server data.
 * This hook is the primary source of project list data for components like the ProjectsPage.
 *
 * @returns {object} The query object from React Query, which includes:
 * - `data`: The array of normalized project objects.
 * - `isLoading`: A boolean indicating if the initial fetch is in progress.
 * - `isError`: A boolean indicating if the fetch resulted in an error.
 * - and other helpful properties provided by React Query.
 */
export const useProjects = () => {
  // Return the query hook configured for fetching all projects.
  return useQuery({
    // `queryKey` is a unique identifier for this specific query. React Query
    // uses this key for caching. Any component that uses this hook will share
    // the same cached data, preventing redundant API calls.
    queryKey: ['projects'],

    // `queryFn` is the asynchronous function that will be executed to fetch the data.
    // Here, we provide a reference to the `fetchProjects` function from our service layer.
    queryFn: fetchProjects, 
  });
};
