// FILE: src/components/tables/InfoTable.jsx
// Purpose: A generic, reusable table component that can display data,
//          render action buttons, and show expandable dropdown content.

import React from 'react';
import Badge from '../common/Badge';
import DropDown from '../dropdowns/DropDown';
import styles from './InfoTable.module.css';

/**
 * A reusable table component designed to display data in a structured format.
 * It supports custom columns, action buttons, and expandable rows that can
 * display additional details in a dropdown.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.columns - An array of column configuration objects (e.g., { key, label }).
 * @param {Array<object>} props.data - The array of data to be rendered in the table rows.
 * @param {Array<object>} [props.dropdownData=[]] - Optional data for the expandable dropdown rows.
 * @returns {React.ReactElement} The rendered table component.
 */
const InfoTable = ({ columns, data, dropdownData = [] }) => {
  // State to keep track of which row is currently expanded to show its dropdown.
  // `null` means no row is expanded.
  const [expandedRowId, setExpandedRowId] = React.useState(null);

  // If there's no data, display a simple message instead of an empty table.
  if (!data.length) {
    return <div>No data found.</div>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Map over the data array to create a row for each item. */}
        {data.map((item, index) => (
          // Use React.Fragment to group the main row and its optional dropdown row
          // without adding extra nodes to the DOM.
          <React.Fragment key={item.id}>
            <tr
              className={styles.tableRow}
              onClick={() =>
                // Toggle the expanded state: if the clicked row is already expanded, collapse it.
                // Otherwise, expand the clicked row.
                setExpandedRowId(item.id === expandedRowId ? null : item.id)
              }
            >
              {columns.map(col => {
                // --- Special Column Rendering Logic ---

                // Case 1: The 'status' column, which renders a Badge component.
                if (col.key === 'status') {
                  return (
                    <td key={col.key}>
                      <Badge
                        text={item.fields.status || 'N/A'}
                        type={item.actions?.isActive ? 'active' : 'disabled'}
                      />
                    </td>
                  );
                }

                // Case 2: The 'actions' column, which renders buttons based on provided handlers.
                if (col.key === 'actions') {
                  return (
                    <td key={col.key} className={styles.actionsCell}>
                      {/* Conditionally render each action button only if its handler exists. */}
                      {item.actions?.onToggleStatus && (
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the row's onClick from firing.
                            item.actions.onToggleStatus();
                          }}
                        >
                          {item.actions.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                      {item.actions?.onDelete && (
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click.
                            item.actions.onDelete();
                          }}
                        >
                          Delete
                        </button>
                      )}
                      {/* --- FIXED: Now correctly looks for onNavigate handler --- */}
                      {item.actions?.onNavigate && (
                        <button
                          className={styles.actionBtn}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click.
                            item.actions.onNavigate();
                          }}
                        >
                          Open
                        </button>
                      )}
                    </td>
                  );
                }

                // Default Case: Render regular data cells.
                return <td key={col.key}>{item.fields[col.key] || '—'}</td>;
              })}
            </tr>

            {/* Conditionally render the dropdown row for the expanded item. */}
            {dropdownData[index]?.content?.length > 0 && expandedRowId === item.id && (
              <tr className={styles.dropdownRow}>
                {/* The cell spans the entire width of the table. */}
                <td colSpan={columns.length}>
                  <DropDown 
                    content={dropdownData[index]?.content || []} 
                    columns={dropdownData[index]?.columns || []} 
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default InfoTable;
