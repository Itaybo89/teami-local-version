// File: backend/routes/projectRoutes.js
// Description: Routes for managing projects — create, fetch, delete, and update status.

const express = require('express');
const router = express.Router();
const { z } = require('zod');

const projectController = require('../controllers/projectController');
const authenticate = require('../middleware/authenticate');
const validateInput = require('../middleware/validateInput');

// Schema for project creation
const CreateProjectSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
  tokenId: z.number().optional(),
  agents: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      description: z.string().min(1),
      model: z.string().min(1),
      prompt: z.string().optional(),
      canMessageIds: z.array(z.number()).optional(),
    })
  ).optional(),
});

// Routes
router.get('/', authenticate, projectController.getProjects); // List all projects
router.get('/:id', authenticate, projectController.getProjectById); // Get a single project
router.post('/', authenticate, validateInput(CreateProjectSchema), projectController.createProject); // Create new project
router.delete('/:id', authenticate, projectController.deleteProject); // Delete project
router.post('/:id/status', authenticate, projectController.updateProjectStatus); // Pause/resume project

module.exports = router;
