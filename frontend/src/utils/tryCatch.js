// FILE: frontend/src/utils/tryCatch.js
// Purpose: Provides a higher-order async utility function to wrap promises
//          and handle success/error states with toast notifications.

import { showToast } from './toastUtils';
import { extractErrorMessage } from './errorHandler';

/**
 * A utility that wraps an asynchronous function in a try/catch block
 * to automatically handle success and error notifications.
 *
 * This function promotes cleaner code in data-fetching hooks and other
 * async operations by centralizing error handling and user feedback.
 *
 * @param {Function} fn - The asynchronous function to execute. This function
 * should be a promise-returning function (e.g., an API call).
 * @param {object} [options={}] - An optional configuration object.
 * @param {string} [options.success] - A success message to show in a toast
 * if the function `fn` resolves successfully. If omitted, no success toast is shown.
 * @param {string} [options.error] - A custom error message to show in a toast
 * if the function `fn` rejects. If omitted, the error message is extracted
 * from the caught error itself.
 * @returns {Promise<any>} The result of the wrapped function `fn` if it succeeds.
 * @throws Will re-throw the original error after displaying the error toast,
 * allowing the calling function to perform additional error handling if needed.
 */
export const tryCatch = async (fn, options = {}) => {
  const { success, error } = options;

  try {
    // Attempt to execute the provided asynchronous function.
    const result = await fn();

    // If the function succeeds and a success message is provided, show a success toast.
    if (success) {
      showToast(success, 'success');
    }

    // Return the successful result to the original caller.
    return result;

  } catch (err) {
    // If the function fails, extract a user-friendly message from the error object.
    const msg = extractErrorMessage(err);
    
    // Show an error toast, using the custom error message from options if provided,
    // otherwise defaulting to the extracted message.
    showToast(error || msg, 'error');

    // Re-throw the error so that the calling context (e.g., React Query's `onError`
    // callback) can still react to the failure state.
    throw err;
  }
};
