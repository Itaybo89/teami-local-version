// File: backend/config/constants.js
// Description: Centralized definition of enums and system-wide configuration constants

// Types of messages exchanged in the system
const MESSAGE_TYPES = {
  USER: 'user',           // Message from a human user
  SYSTEM: 'system',       // Internal system-generated message
  ASSISTANT: 'assistant', // Message from an AI assistant
  ERROR: 'error',         // Message indicating an error occurred
};

// Possible statuses for a message
const MESSAGE_STATUS = {
  SENT: 'sent',           // Message successfully sent
  PENDING: 'pending',     // Message is queued or being processed
  ERROR: 'error',         // Message failed to send or process
};

// Token states used to control agent/API access
const TOKEN_STATUS = {
  ACTIVE: 'active',       // Token is enabled and usable
  INACTIVE: 'inactive',   // Token is disabled or revoked
};

// System-wide configuration parameters
const SYSTEM = {
  MAX_MESSAGE_LENGTH: 2000, // Maximum characters allowed per message
  DEFAULT_LIMIT: 20,        // Default message limit per project/session
};

module.exports = {
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  TOKEN_STATUS,
  SYSTEM,
};
