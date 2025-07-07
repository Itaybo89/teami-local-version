// FILE: src/components/auth/RegisterBox.jsx
// Purpose: Provides a user interface for new users to register an account.
//          It collects username, email, and password, handles form submission,
//          and interacts with the authentication context for registration.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { useAuth } from '../../context/AuthContext'; // Imports authentication context to register new users
import styles from './LoginBox.module.css'; // Reuses the same CSS styles as LoginBox for consistency

/**
 * RegisterBox component presents a registration form for creating new user accounts.
 * It captures user input for username, email, and password, then attempts to register
 * the user via the `useAuth` context. Upon successful registration, it navigates
 * the user to the dashboard. It also provides a link to switch to the login form.
 *
 * @param {object} props - The component's properties.
 * @param {Function} props.onSwitch - Callback function to switch to the login form view.
 * @returns {JSX.Element} A div element containing the registration form.
 */
const RegisterBox = ({ onSwitch }) => {
  // Destructure the `register` function from the authentication context.
  const { register } = useAuth();
  // Hook to enable programmatic navigation after successful registration.
  const navigate = useNavigate();

  // State to manage the form input fields (username, email, password).
  // The field names `username`, `email`, `password` are designed to match backend expectations.
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  // State to manage and display any registration error messages to the user.
  const [error, setError] = useState('');

  /**
   * Handles changes in any of the form input fields.
   * It updates the corresponding property in the `form` state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input.
   */
  const handleChange = (e) => {
    // Update the state for the specific input field that changed, preserving other fields.
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Handles the submission of the registration form.
   * It prevents default form submission, attempts to register the user,
   * navigates to the dashboard on success, or sets an error message on failure.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default browser form submission (page reload).
    setError(''); // Clear any previous error messages.
    try {
      // Call the register function from the AuthContext with current form data.
      await register(form);
      navigate('/dashboard'); // On successful registration, navigate to the dashboard.
    } catch (err) {
      // Log the detailed error to the console for debugging.
      console.error('Registration error:', err);
      // Set a user-friendly error message to be displayed in the UI.
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className={styles.loginSection}>
      <h2>Create Account</h2>
      <form onSubmit={handleRegister}>
        {/* Username Input Field */}
        <input
          name="username" // Matches backend field name
          placeholder="Full Name"
          value={form.username}
          onChange={handleChange}
          required // Mark as required field
        />
        {/* Email Input Field */}
        <input
          name="email"
          type="email" // Specifies email type for browser validation/keyboard
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {/* Password Input Field */}
        <input
          name="password"
          type="password" // Masks input for password security
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {/* Register Button */}
        <button type="submit">Register</button>
        {/* Display error message if `error` state is not empty */}
        {error && <p className={styles.error}>{error}</p>}
      </form>
      {/* Link to switch to the Login form */}
      <p>
        Already have an account?{' '}
        <button type="button" onClick={onSwitch}>
          Log in here
        </button>
      </p>
    </div>
  );
};

export default RegisterBox;