// File: backend/routes/internalRoutes.js
// Description: Secure internal API endpoints for the Brain and Watchdog systems.

const express = require('express');
const router = express.Router();
const internalController = require('../controllers/internalController');

// Middleware: Validates access to internal routes using a secret API key
const brainAuthMiddleware = (req, res, next) => {
  const apiKey = req.get('X-Brain-Api-Key');

  // Ensure BRAIN_API_KEY is defined in .env
  if (apiKey && apiKey === process.env.BRAIN_API_KEY) {
    return next();
  }

  res.status(401).json({ message: 'Unauthorized: Missing or invalid API key.' });
};

// Apply authentication to all internal routes
router.use(brainAuthMiddleware);


// ─────────── Brain Core Loop Routes ───────────

// Retrieves full project context: agents, messages, conversations, summaries
router.get('/context/:projectId', internalController.getBrainContext);

// Fetches pending messages the brain needs to process
router.get('/messages/pending/:projectId', internalController.getPendingWorkQueue);

// Creates a new message from an agent
router.post('/messages', internalController.createAgentMessage);

// Updates a message's status (e.g., sent, failed)
router.put('/messages/:messageId/status', internalController.updateMessageStatus);

// Creates a new system log entry
router.post('/logs', internalController.createLogEntry);

// Saves a new agent summary (memory)
router.post('/summaries', internalController.createSummary);

// Retrieves the latest summary for a specific agent
router.get('/summaries/:projectId/:agentId', internalController.getAgentSummary);

// Retrieves all agent summaries for a project
router.get('/summaries/:projectId', internalController.getProjectSummaries);

// Decrements the message limit for a project
router.put('/projects/:projectId/decrement-limit', internalController.decrementMessageLimit);

// Increments an agent's message count (used for summarization tracking)
router.post('/agents/:projectId/:agentId/increment-count', internalController.incrementAgentMessageCount);

// Returns current flags for a project (paused, limits, etc.)
router.get('/projects/:projectId/flags', internalController.getProjectFlags);

// Gets recent messages involving a specific agent
router.get('/agents/:projectId/:agentId/messages', internalController.getAgentRecentMessages);


// ─────────── Watchdog Monitoring Routes ───────────

// Returns all currently active projects
router.get('/projects/active', internalController.getActiveProjects);

// Returns timestamp of the oldest pending message in a project
router.get('/projects/:projectId/oldest-pending', internalController.getOldestPendingTimestamp);

// Pauses a project due to inactivity or system issue
router.put('/projects/:projectId/pause', internalController.pauseProject);


module.exports = router;
