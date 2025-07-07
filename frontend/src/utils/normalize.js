// FILE: src/utils/normalize.js
// Purpose: Provides a suite of "normalizer" functions. These functions take raw data objects
// from the API and transform them into a consistent, predictable shape for use within the
// frontend application. This helps prevent errors from missing keys, inconsistent naming
// (snake_case vs. camelCase), or incorrect data types.
//
// UPDATED: This version is now aligned with the `schema.sql` to ensure all fields are mapped correctly,
// preferring camelCase output for frontend consistency.

// === Shared Utility ===

/**
 * A shared helper to standardize date formatting.
 * @param {string | undefined} timestamp - The raw timestamp from the API.
 * @returns {string | null} An ISO-formatted date string, or null if the input is falsy.
 */
export const formatDate = (timestamp) =>
  timestamp ? new Date(timestamp).toISOString() : null;


// === AGENTS ===

/**
 * Normalizes an agent object from the API into a clean format for the UI.
 * Aligned with the 'agents' table in schema.sql.
 * @param {object} agent - The raw agent object from the API.
 * @returns {object} A normalized agent object with a consistent structure.
 */
export const normalizeAgent = (agent) => ({
  id: agent.id,
  // FIX: Handles potential snake_case from DB or camelCase from API
  userId: agent.user_id ?? agent.userId,
  name: agent.name,
  role: agent.role,
  description: agent.description,
  model: agent.model,
  // FIX: Handles potential snake_case from DB or camelCase from API
  createdAt: formatDate(agent.created_at || agent.createdAt),
});


// === PROJECTS (for viewing) ===

/**
 * Normalizes a project object from the API for display purposes.
 * Aligned with the 'projects' table in schema.sql.
 * @param {object} project - The raw project object from the API.
 * @returns {object} A normalized project object ready for use in UI components.
 */
export const normalizeProject = (project) => ({
  id: project.id,
  // FIX: Handles potential snake_case from DB or camelCase from API
  userId: project.user_id ?? project.userId,
  title: project.title,
  description: project.description,
  // FIX: Handles potential snake_case from DB or camelCase from API
  systemPrompt: project.system_prompt ?? project.systemPrompt,
  // FIX: Converts 'paused' (from schema) to 'isPaused' for the frontend. The API already sends isPaused.
  isPaused: project.paused ?? project.isPaused ?? false,
  // FIX: Handles potential snake_case from DB or camelCase from API
  messageLimit: project.message_limit ?? project.messageLimit ?? 0,
  // FIX: Handles potential snake_case from DB or camelCase from API
  createdAt: formatDate(project.created_at || project.createdAt),
  // FIX: Handles potential snake_case from DB or camelCase from API
  lastActivityAt: formatDate(project.last_activity_at || project.lastActivityAt),
  // ADDED: Explicitly handles tokenId based on the `project_tokens` relationship (though likely joined in backend)
  tokenId: project.token_id ?? project.tokenId ?? null,
  // This part remains correct as agent objects are nested.
  agents: project.agents?.map(normalizeAgent) || [],
  tokens: project.tokens?.map(normalizeToken) || [], // Assuming tokens can be nested
});


// === PROJECTS (for submission) ===
// This function transforms frontend data for the backend, so it should generally produce snake_case if the backend API expects it.
// We will keep this as-is for now, assuming the backend can handle camelCase inputs.
/**
 * Normalizes a project object from a form state into a clean payload for API submission.
 * @param {object} projectData - The project data from a form.
 * @returns {object} A clean project object ready to be sent to the API.
 */
export const normalizeProjectForSubmit = ({
  title,
  description,
  systemPrompt,
  tokenId,
  agents = [],
}) => ({
  title: title?.trim() || '',
  description: description?.trim() || '',
  systemPrompt: systemPrompt?.trim() || '',
  tokenId,
  agents: agents.map((a) => ({
    name: a.name?.trim() || '',
    role: a.role?.trim() || '',
    description: a.description?.trim() || '',
    model: a.model?.trim() || '',
    prompt: a.prompt?.trim() || '',
    // This seems specific to the frontend logic, remains correct.
    canMessageIds: Array.isArray(a.canMessageIds)
      ? a.canMessageIds.map(Number)
      : [],
  })),
});


// === TOKENS ===

/**
 * Normalizes a token object from the API.
 * @param {object} token - The raw token object.
 * @returns {object} A normalized token object.
 */
export const normalizeToken = (token) => ({
  id: token.id,
  name: token.name,
  userId: token.userId,
  isActive: token.active,
  createdAt: formatDate(token.createdAt),
  // --- FIX: Add this line ---
  // Map the incoming `is_used` (snake_case) from the API 
  // to the `isUsed` (camelCase) property used by the frontend.
  isUsed: token.is_used ?? false, 
});


// === CONVERSATIONS ===

/**
 * Normalizes a conversation object.
 * Aligned with the 'conversations' table in schema.sql.
 * @param {object} conv - The raw conversation object.
 * @param {object} [agentMap={}] - A map of agent IDs to agent data for name lookups.
 * @returns {object} A normalized conversation object with a `title` and `pairKey`.
 */
export const normalizeConversation = (conv, agentMap = {}) => {
  // FIX: Handles potential snake_case from DB or camelCase from API
  const senderId = conv.sender_id ?? conv.senderId;
  const receiverId = conv.receiver_id ?? conv.receiverId;
  const projectId = conv.project_id ?? conv.projectId;

  const sender = agentMap[senderId]?.name || `Agent ${senderId}`;
  const receiver = agentMap[receiverId]?.name || `Agent ${receiverId}`;
  const pairKey = [senderId, receiverId].sort((a, b) => a - b).join('-');

  return {
    id: conv.id,
    projectId: projectId,
    senderId: senderId,
    receiverId: receiverId,
    title: conv.title || `${sender} → ${receiver}`,
    // FIX: Handles potential snake_case from DB or camelCase from API
    createdAt: formatDate(conv.created_at || conv.createdAt),
    pairKey,
  };
};


// === MESSAGES ===

/**
 * Normalizes a message object.
 * Aligned with the 'messages' table in schema.sql.
 * @param {object} msg - The raw message object from the API or WebSocket.
 * @returns {object} A normalized message object.
 */
export const normalizeMessage = (msg) => ({
  id: msg.id,
  // FIX: Handles potential snake_case from DB or camelCase from API
  conversationId: msg.conversation_id ?? msg.conversationId,
  projectId: msg.project_id ?? msg.projectId,
  senderId: msg.sender_id ?? msg.senderId,
  receiverId: msg.receiver_id ?? msg.receiverId,
  content: msg.content || msg.body, // Keep alias for flexibility
  type: msg.type,
  status: msg.status,
  // FIX: Handles potential snake_case from DB or camelCase from API
  createdAt: formatDate(msg.created_at || msg.createdAt),
});


// === LOGS ===

/**
 * Normalizes a log object.
 * Aligned with the 'logs' table in schema.sql.
 * @param {object} log - The raw log object from the API.
 * @returns {object} A normalized log object.
 */
export const normalizeLog = (log) => ({
  id: log.id,
  // FIX: Handles potential snake_case from DB or camelCase from API
  projectId: log.project_id ?? log.projectId,
  level: log.level,
  code: log.code || null,
  message: log.message,
  // FIX: Handles potential snake_case from DB or camelCase from API
  createdAt: formatDate(log.created_at || log.createdAt),
});