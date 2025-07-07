// FILE: src/config/demoIds.js
// Purpose: Centralizes the configuration for "demo mode" by parsing specific
//          IDs and settings from environment variables. This keeps demo-related
//          logic separate from the main application code.

/**
 * The ID of the specific API token to be used for demo projects.
 * It's parsed from an environment variable to ensure it's an integer.
 * If the variable is not set, it defaults to `2`.
 * @type {number}
 */
export const DEMO_TOKEN_ID = parseInt(import.meta.env.VITE_DEMO_TOKEN_ID, 10) || 2;

/**
 * An array of project IDs that are considered "demo" projects.
 * This is parsed from a comma-separated string in the environment variables.
 * If the variable is not set, it defaults to `[1, 2]`.
 * @type {Array<number>}
 */
export const DEMO_PROJECT_IDS = (import.meta.env.VITE_DEMO_PROJECT_IDS || '1,2')
  .split(',')
  .map((id) => parseInt(id.trim(), 10));

/**
 * The ID of a specific project to be used as a "snapshot" or featured example.
 * It's parsed from an environment variable and defaults to `1` if not set.
 * @type {number}
 */
export const SNAPSHOT_PROJECT_ID = parseInt(import.meta.env.VITE_SNAPSHOT_PROJECT_ID, 10) || 1;

/**
 * The ID of the user account considered the "demo user".
 * Parsed from an environment variable, defaults to `2`.
 * @type {number}
 */
export const DEMO_USER_ID = parseInt(import.meta.env.VITE_DEMO_USER_ID, 10) || 2;

/**
 * The maximum number of messages a user can send in a demo project.
 * Parsed from an environment variable, defaults to `20`.
 * @type {number}
 */
export const DEMO_PROJECT_LIMIT = parseInt(import.meta.env.VITE_DEMO_PROJECT_LIMIT, 10) || 20;