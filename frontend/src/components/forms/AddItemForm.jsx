// FILE: src/components/forms/AddItemForm.jsx
// Purpose: A reusable form component for adding new items, designed to be
//          flexible by taking an array of field definitions. It handles
//          form state, input changes, and submission.

import React, { useState } from 'react';
import styles from './AddItemForm.module.css'; // Imports CSS module for form styling

/**
 * AddItemForm is a versatile component for collecting data to add a new item.
 * It dynamically renders input fields based on a `fields` array and manages
 * the form's state. Upon submission, it calls an `onSubmit` callback with the
 * collected data and resets the form.
 *
 * @param {object} props - The component's properties.
 * @param {Function} props.onSubmit - A callback function invoked when the form is submitted.
 * It receives the `formData` object as its argument.
 * @param {Array<object>} props.fields - An array of objects, each defining an input field.
 * Each field object should contain:
 * - `name` (string): The HTML `name` attribute and key for its value in `formData`.
 * - `type` (string, optional): The HTML `type` attribute (defaults to 'text').
 * - `placeholder` (string, optional): The input's placeholder text (defaults to `name`).
 * - `required` (boolean, optional): Whether the input is required (defaults to `true`).
 * @param {string} [props.buttonLabel='Add'] - The text to display on the submit button.
 * @returns {JSX.Element} A form element containing dynamically generated input fields and a submit button.
 */
const AddItemForm = ({ onSubmit, fields, buttonLabel = 'Add' }) => {
  // Initialize form data state. It creates an object where keys are field names
  // and initial values are empty strings, based on the provided 'fields' array.
  const [formData, setFormData] = useState(() =>
    Object.fromEntries(fields.map(f => [f.name, '']))
  );

  /**
   * Handles changes to any input field in the form.
   * It updates the `formData` state with the new value for the corresponding field.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input.
   */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Handles the form submission event.
   * Prevents default form behavior, calls the `onSubmit` prop with the current
   * form data, and then resets the form fields to empty.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser form submission.
    onSubmit(formData); // Call the provided onSubmit callback with the current data.
    // Reset form fields by re-initializing `formData` to empty strings.
    setFormData(Object.fromEntries(fields.map(f => [f.name, ''])));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Map through the 'fields' array to render an input for each defined field. */}
      {fields.map((field) => (
        <input
          key={field.name} // Unique key for list rendering.
          type={field.type || 'text'} // Set input type, default to 'text'.
          name={field.name} // Set input name, used for `formData` key.
          value={formData[field.name]} // Controlled component: value from state.
          onChange={handleChange} // Update state on change.
          placeholder={field.placeholder || field.name} // Placeholder text.
          required={field.required ?? true} // Mark as required, default to true.
        />
      ))}
      {/* Submit button for the form */}
      <button type="submit">{buttonLabel}</button>
    </form>
  );
};

export default AddItemForm;