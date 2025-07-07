// FILE: frontend/src/utils/toastUtils.js
// Purpose: Provides a centralized wrapper for displaying toast notifications
//          using the react-toastify library.

import { toast } from 'react-toastify';

/**
 * Displays a toast notification with a given message and type.
 *
 * This function acts as a simple, consistent interface for creating toasts
 * throughout the application.
 *
 * @param {string} message - The message content to be displayed in the toast.
 * @param {('info'|'success'|'warn'|'error')} [type='info'] - The type of toast
 * to display, which determines its color and icon. Defaults to 'info'.
 */
export const showToast = (message, type = 'info') => {
  // Dynamically call the appropriate function on the toast object
  // based on the 'type' parameter (e.g., toast.success('...'), toast.error('...')).
  toast[type](message);
};
