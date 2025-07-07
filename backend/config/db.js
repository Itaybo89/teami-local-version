// FILE: backend/config/db.js
// Description: PostgreSQL database connection using pg-promise

const pgp = require('pg-promise')();
const { db: dbConfig } = require('../env'); 

// Initialize and export database connection
const db = pgp({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.name,
  user: dbConfig.user,
  password: dbConfig.password,
});

module.exports = db;
