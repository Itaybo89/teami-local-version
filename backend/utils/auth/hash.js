// FILE: backend/utils/auth/hash.js

const bcrypt = require('bcrypt');

// Hash a plaintext password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Compare a plaintext password with a hashed one
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};
