// File: backend/services/brainService.js
// Description: Provides an interface to communicate with the Python "brain" server.

const axios = require('axios');

// The brain server URL is stored in an environment variable
const BRAIN_API_URL = process.env.BRAIN_API_URL;

/**
 * Sends a "nudge" to the brain server, requesting it to process tasks for a specific project.
 * @param {number} projectId - The ID of the project to process.
 */
const nudgeBrain = async (projectId) => {
  if (!BRAIN_API_URL) {
    console.error('ERROR: BRAIN_API_URL is not configured in environment variables.');
    return;
  }

  try {
    console.log(`Sending nudge to brain for project ${projectId}`);
    const payload = { project_id: projectId };
    await axios.post(`${BRAIN_API_URL}/nudge-brain`, payload); // Matches route in brain/main.py
  } catch (error) {
    console.error(`ERROR: Failed to nudge brain for project ${projectId}. Reason: ${error.message}`);
  }
};

module.exports = {
  nudgeBrain,
};
