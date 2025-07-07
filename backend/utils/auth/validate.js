// FILE: backend/utils/auth/validate.js

// ✅ Basic email format validation
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ✅ Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

// ✅ Check for non-empty string
const isNotEmpty = (val) =>
  typeof val === 'string' && val.trim().length > 0;

module.exports = {
  isValidEmail,
  isStrongPassword,
  isNotEmpty,
};
