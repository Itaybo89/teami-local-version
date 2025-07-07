// File: backend/routes/logRoutes.js
// Description: Routes for retrieving and deleting logs for a specific project.

const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authenticate');
const logController = require('../controllers/logController');

// Route: GET /api/logs/:projectId — Fetch logs for a project
router.get('/:projectId', authenticate, logController.getLogsByProject);

// Route: DELETE /api/logs/:projectId — Delete all logs for a project
router.delete('/:projectId', authenticate, logController.deleteLogsByProject);

module.exports = router;
