// FILE: src/components/auth/LoginBox.jsx
// Purpose: Provides a user interface for existing users to log in to the application.
//          It handles user credentials input, authenticates via the AuthContext,
//          and offers a demo login option.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import { useAuth } from '../../context/AuthContext'; // Imports authentication context to handle login
import styles from './LoginBox.module.css'; // Imports CSS module for styling the login form

/**
 * LoginBox component presents a login form for existing users.
 * It captures email and password, attempts to authenticate the user via the `useAuth` context,
 * and navigates to the dashboard upon successful login. It also includes a demo login feature
 * and a link to switch to the registration form.
 *
 * @param {object} props - The component's properties.
 * @param {Function} props.onSwitch - Callback function to switch to the registration form view.
 * @returns {JSX.Element} A div element containing the login form.
 */
const LoginBox = ({ onSwitch }) => {
  // Destructure the `login` function from the authentication context.
  const { login } = useAuth();
  // Hook to enable programmatic navigation after successful login.
  const navigate = useNavigate();

  // State to manage the input for the user's email.
  const [email, setEmail] = useState('');
  // State to manage the input for the user's password.
  const [password, setPassword] = useState('');
  // State to manage and display any login error messages.
  const [error, setError] = useState('');

  /**
   * Handles the submission of the login form.
   * Prevents default form submission, attempts to log in the user with provided credentials,
   * navigates to the dashboard on success, or sets an error message on failure.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default browser form submission (page reload).
    setError(''); // Clear any previous error messages.
    try {
      // Attempt to log in using the email and password from state.
      await login({ email, password });
      navigate('/dashboard'); // On successful login, navigate to the dashboard.
    } catch {
      // If login fails, set a generic error message for the user.
      setError('Login failed. Please check your credentials.');
    }
  };

  /**
   * Handles the demo login action.
   * Attempts to log in as a predefined demo user and navigates to the dashboard on success.
   * Sets an error message if the demo login fails.
   */
  const handleDemoLogin = async () => {
    setError(''); // Clear any previous error messages.
    try {
      // Attempt to log in with hardcoded demo credentials.
      await login({ email: 'demo@demo.com', password: 'demo123' });
      navigate('/dashboard'); // On successful demo login, navigate to the dashboard.
    } catch {
      // If demo login fails, set an error message.
      setError('Failed to login as demo user.');
    }
  };

  return (
    <div className={styles.loginSection}>
      <h2>Sign In</h2>
      <form onSubmit={handleLogin}>
        {/* Email Input Field */}
        <input
          type="email" // Specifies email type for browser validation/keyboard.
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email state on change.
          required // Mark as required field.
        />
        {/* Password Input Field */}
        <input
          type="password" // Masks input for password security.
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password state on change.
          required // Mark as required field.
        />
        {/* Standard Login Button */}
        <button type="submit">Login</button>
        {/* Display error message if `error` state is not empty. */}
        {error && <p className={styles.error}>{error}</p>}

        {/* Demo Login Button */}
        {/* Moved inside the form for consistent alignment with other form elements. */}
        <button
          type="button" // Important: 'button' type prevents accidental form submission.
          onClick={handleDemoLogin} // Triggers the demo login function.
          className={styles.demoButton} // Apply specific styling for the demo button.
        >
          Try Demo Without Registering
        </button>
      </form>

      {/* Link to switch to the Register form */}
      <p>
        Don’t have an account?
        <button type="button" onClick={onSwitch}>
          Register here
        </button>
      </p>
    </div>
  );
};

export default LoginBox;