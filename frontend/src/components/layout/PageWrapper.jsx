// FILE: src/components/layout/PageWrapper.jsx
// Purpose: Provides a consistent layout wrapper for individual content pages across the application.
//          It includes standard padding, handles scrolling for long content, and can display a page title.

import React from 'react';
import styles from './PageWrapper.module.css'; // Imports CSS module for page layout styling

/**
 * PageWrapper component provides a consistent container for page content.
 * It sets up the basic layout, including padding and scroll behavior,
 * and optionally displays a title at the top of the page.
 *
 * @param {object} props - The component's properties.
 * @param {string} [props.title] - The title of the page to be displayed at the top.
 * @param {React.ReactNode} props.children - The child components or elements to be rendered within the page content area.
 * @returns {JSX.Element} A div element wrapping the page's content.
 */
const PageWrapper = ({ title, children }) => {
  return (
    <div className={styles.wrapper}>
      {/* Conditionally renders the page title if the 'title' prop is provided */}
      {title && <h1 className={styles.title}>{title}</h1>}
      {/* This div acts as the main container for the page's content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default PageWrapper;