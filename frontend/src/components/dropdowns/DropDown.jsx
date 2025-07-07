// FILE: src/components/dropdowns/DropDown.jsx
// Purpose: A generic dropdown component designed to display data in a tabular format.
//          It dynamically renders headers and rows based on provided content and column definitions.

import React from 'react';
import styles from './Dropdown.module.css'; // Imports CSS module for styling the dropdown table

/**
 * DropDown component renders a simple table within a dropdown-like container.
 * It's useful for displaying structured data where columns are known.
 *
 * @param {object} props - The component's properties.
 * @param {Array<object>} [props.content=[]] - An array of objects, where each object represents a row of data.
 * Each object's keys should correspond to the lowercase version of the `columns` names.
 * @param {Array<string>} [props.columns=[]] - An array of strings, where each string is a column header.
 * These strings are used to create table headers and to look up corresponding values in the `content` objects.
 * @returns {JSX.Element | null} A div element containing the dropdown table, or `null` if no content is provided.
 */
const DropDown = ({ content = [], columns = [] }) => {
  // If content is not an array or is empty, don't render anything.
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  // Log the content and columns for debugging purposes.
  // console.log("Dropdown content:", content, "columns:", columns);

  return (
    <div className={styles.dropdownContainer}>
      <table className={styles.dropdownTable}>
        <thead>
          <tr>
            {/* Map through the 'columns' array to create table headers */}
            {columns.map(col => (
              <th key={col}>{col}</th> // Each column string becomes a table header
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Map through the 'content' array to create table rows */}
          {content.map((row, idx) => (
            <tr key={idx}> {/* Use index as a key if no unique ID is available for rows */}
              {/* Map through the 'columns' again to populate data cells for each row */}
              {columns.map(col => (
                // Access data from the `row` object using the lowercase column name as the key.
                // Fallback to '—' (em dash) if the data is not available.
                <td key={col}>{row[col.toLowerCase()] || '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DropDown;