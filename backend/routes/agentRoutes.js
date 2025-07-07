// File: backend/routes/agentRoutes.js
// Description: Route definitions for managing user-defined agents.

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const agentController = require('../controllers/agentController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Schema for validating new agent input
const AddAgentSchema = z.object({
  name: z.string().min(2, 'Agent name is required'),
  role: z.string().min(1, 'Agent role is required'),
  description: z.string().min(1, 'Agent description is required'),
  model: z.string().min(1, 'Model is required'),
});

// Route: GET /api/agents — List all user agents
router.get('/', authenticate, agentController.getAgents);

// Route: POST /api/agents — Create a new agent
router.post('/', authenticate, validateInput(AddAgentSchema), agentController.addAgent);

// router.delete('/:id', authenticate, agentController.deleteAgent); // Optional future endpoint

module.exports = router;
