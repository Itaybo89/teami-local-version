// FILE: backend/env.js

require('dotenv').config({ path: '../.env' });

// List of required environment variables
const required = [
  'DB_HOST',
  'DB_PORT',
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'ENCRYPT_SECRET',
  'PORT',
  'BRAIN_API_KEY',
  'BRAIN_API_URL',
  'DEMO_USER_ID',
  'DEMO_TOKEN_ID',
  'DEMO_PROJECT_ID',
  'SNAPSHOT_PROJECT_ID',
  'DEMO_PROJECT_LIMIT',
];

// Check for missing keys
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

// Optional: helper to parse int or return null
const parseIntOrNull = (val) => (val ? parseInt(val, 10) : null);

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwtSecret: process.env.JWT_SECRET,
  encryptSecret: process.env.ENCRYPT_SECRET,
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  brainApiKey: process.env.BRAIN_API_KEY,
  brainApiUrl: process.env.BRAIN_API_URL,

  // Demo + snapshot-specific constraints
  demoUserId: parseIntOrNull(process.env.DEMO_USER_ID),
  demoTokenId: parseIntOrNull(process.env.DEMO_TOKEN_ID),
  demoProjectId: parseIntOrNull(process.env.DEMO_PROJECT_ID),
  snapshotProjectId: parseIntOrNull(process.env.SNAPSHOT_PROJECT_ID),
  demoProjectLimit: parseIntOrNull(process.env.DEMO_PROJECT_LIMIT)
};
