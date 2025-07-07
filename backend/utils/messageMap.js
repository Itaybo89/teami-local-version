// FILE: backend/utils/messageMap.js

const messages = {
  // Auth
  'auth.invalidToken': 'Invalid or expired token.',
  'auth.missingToken': 'Access denied. Token is missing.',
  'auth.failedLogin': 'Incorrect email or password.',
  'auth.emailInUse': 'This email is already registered.',
  'auth.registrationSuccess': 'Registration successful.',

  // User
  'user.notFound': 'User not found.',

  // Tokens
  'token.notFound': 'Token not found.',
  'token.invalid': 'Token is invalid or inactive.',
  'token.addSuccess': 'Token added successfully.',
  'token.deleteSuccess': 'Token deleted successfully.',
  'token.protectedDemo': 'This demo token cannot be deleted or disabled.',

  // Agents
  'agent.notFound': 'Agent not found.',
  'agent.invalid': 'Invalid agent data.',
  'agent.addSuccess': 'Agent created successfully.',
  'agent.deleteSuccess': 'Agent deleted.',

  // Projects
  'project.notFound': 'Project not found.',
  'project.createSuccess': 'Project created successfully.',
  'project.deleteSuccess': 'Project deleted.',
  'project.protectedDemo': 'This demo project cannot be deleted.',
  'project.snapshotLocked': 'This snapshot project cannot be continued.',
  'project.snapshotModified': 'Snapshot project cannot be modified.',
  'project.limitExceeded': 'You cannot set the message limit above the allowed threshold for the demo project.',

  // Conversations & Messages
  'conversation.notFound': 'Conversation not found.',
  'message.invalidType': 'Invalid message type.',
  'message.queueAccepted': 'Message queued.',
  'message.sendSuccess': 'Message sent successfully.',

  // General/System
  'error.unexpected': 'An unexpected error occurred.',
  'error.missingFields': 'Required fields are missing.',
  'error.forbidden': 'You are not authorized to perform this action.',
  'error.notFound': 'Requested resource was not found.',

  // Settings
  'project.tokenSwitched': 'Project token updated successfully.',
};

module.exports = messages;
