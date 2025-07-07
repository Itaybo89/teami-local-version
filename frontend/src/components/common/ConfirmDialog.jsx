// FILE: src/components/common/ConfirmDialog.jsx
// Purpose: A reusable modal dialog component to prompt the user for confirmation
//          before performing a critical action.

import React from 'react';
import styles from './ConfirmDialog.module.css';

/**
 * A reusable confirmation dialog modal.
 * This component displays a modal window that prompts the user for a "Confirm"
 * or "Cancel" action, typically before executing a destructive or irreversible operation.
 * It is controlled by the `isOpen` prop.
 *
 * @param {object} props - The component's properties.
 * @param {boolean} props.isOpen - Controls the visibility of the dialog. If `false`, the component renders `null`.
 * @param {string} props.title - The title text displayed prominently in the dialog's header.
 * @param {React.ReactNode} props.children - The main content or message to be displayed within the dialog's body.
 * This can be plain text, other components, or a mix.
 * @param {Function} props.onClose - The callback function invoked when the dialog should be closed.
 * This typically happens when the "Cancel" button is clicked or the modal overlay is clicked.
 * @param {Function} props.onConfirm - The callback function invoked when the "Confirm" button is clicked.
 * This function should contain the logic for the critical action.
 * @returns {React.ReactElement | null} The rendered confirmation dialog component, or `null` if `isOpen` is `false`.
 */
export const ConfirmDialog = ({ isOpen, title, children, onClose, onConfirm }) => {
  // If the `isOpen` prop is false, the dialog is not visible, so render nothing.
  if (!isOpen) {
    return null;
  }

  /**
   * Prevents click events on the modal's content area from "bubbling up"
   * to the overlay. This ensures that clicking inside the dialog
   * doesn't inadvertently trigger the `onClose` handler of the overlay.
   * @param {React.MouseEvent} e - The click event object.
   */
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // The `modalOverlay` creates a translucent backdrop that covers the entire screen
    // when the dialog is open. Clicking this overlay typically closes the dialog.
    <div className={styles.modalOverlay} onClick={onClose}>
      {/*
        The `modalContent` is the actual dialog box itself.
        `handleContentClick` is attached here to prevent clicks on the dialog
        from closing it via the `modalOverlay`'s `onClick` handler.
      */}
      <div className={styles.modalContent} onClick={handleContentClick}>
        {/* Header section of the dialog, displaying the title */}
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
        </div>
        {/* Body section of the dialog, displaying the main message/content */}
        <div className={styles.modalBody}>
          <p>{children}</p>
        </div>
        {/* Footer section containing action buttons */}
        <div className={styles.modalFooter}>
          {/* Button to cancel the action and close the dialog */}
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          {/* Button to confirm the action, triggering the `onConfirm` callback */}
          <button onClick={onConfirm} className={styles.confirmButton}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};