// FILE: backend/utils/normalize.js

// === Helpers ===
const formatDate = (timestamp) =>
  timestamp ? new Date(timestamp).toISOString() : null;

// === Agents ===
const normalizeAgent = (agent) => ({
  id: agent.id,
  name: agent.name,
  description: agent.description,
  role: agent.role || '—',
  model: agent.model || null,
});

// === Projects (List View) ===
const normalizeProject = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  systemPrompt: project.systemPrompt || '',
  createdAt: formatDate(project.createdAt),
  lastActivityAt: formatDate(project.lastActivityAt),
  isPaused: project.isPaused ?? false, 

  messageLimit: project.messageLimit,
  agents: project.agents?.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    role: a.role || '—',
    model: a.model || null,
    threadId: a.threadId || null, 
  })) || [],
});

// === Projects (Detailed View) ===
const normalizeProjectDetailed = (project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  systemPrompt: project.systemPrompt || '',
  createdAt: formatDate(project.createdAt),
  lastActivityAt: formatDate(project.last_activity_at),
  isPaused: project.isPaused || false,
  messageLimit: project.messageLimit,
  tokenId: project.tokenId ?? null,
  agents: project.agents?.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    role: a.role || '—',
    model: a.model || null,
    prompt: a.prompt || '',
    canMessageIds: a.canMessageIds
      ? a.canMessageIds.split(',').filter(Boolean)
      : [],
    threadId: a.threadId || null,
  })) || [],
  tokens: project.tokens?.map(t => ({
    id: t.id,
    name: t.name,
    active: t.active,
    userId: t.userId,
    assignedAt: formatDate(t.assignedAt),
    createdAt: formatDate(t.createdAt),
  })) || [],
});

// === Tokens ===
const normalizeToken = (token) => ({
  id: token.id,
  name: token.name,
  createdAt: formatDate(token.created_at),
  userId: token.user_id,
  active: token.active,
  is_used: token.is_used,
});

// === Messages ===
const normalizeMessage = (message) => ({
  id: message.id,
  projectId: message.project_id,
  conversationId: message.conversation_id,
  senderId: message.sender_id,
  receiverId: message.receiver_id ?? null,
  content: message.content,
  type: message.type,
  status: message.status,
  createdAt: formatDate(message.created_at),
});

// === Conversations ===
const normalizeConversation = (c) => ({
  id: c.id,
  projectId: c.project_id,
  senderId: c.sender_id,
  receiverId: c.receiver_id,
  createdAt: formatDate(c.created_at),
});

// === Logs ===
const normalizeLog = (log) => ({
  id: log.id,
  projectId: log.project_id,
  level: log.level,
  code: log.code || null,
  message: log.message,
  createdAt: formatDate(log.created_at),
});

module.exports = {
  normalizeAgent,
  normalizeProject,
  normalizeProjectDetailed,
  normalizeToken,
  normalizeMessage,
  normalizeConversation,
  normalizeLog,
};
