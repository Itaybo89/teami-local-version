// File: backend/routes/settingsRoutes.js
// Description: Routes for updating project-specific settings such as token, pause status, and message limit.

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Validation schemas
const SwitchTokenSchema = z.object({
  tokenId: z.number(),
});

const PauseSchema = z.object({
  paused: z.boolean(),
});

// Changed .min(1) to .min(0) to allow setting the limit to zero.
const MessageLimitSchema = z.object({
  limit: z.number().min(0),
});

// Routes
router.patch(
  '/project/:id/token', // Switch token for a project
  authenticate,
  validateInput(SwitchTokenSchema),
  settingsController.switchToken
);

router.patch(
  '/project/:id/pause', // Pause or resume a project
  authenticate,
  validateInput(PauseSchema),
  settingsController.pauseProject
);

router.patch(
  '/project/:id/limit', // Set message limit for a project
  authenticate,
  validateInput(MessageLimitSchema),
  settingsController.setMessageLimit
);

module.exports = router;