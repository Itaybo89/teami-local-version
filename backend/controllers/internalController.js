// FILE: backend/controllers/internalController.js
// Description: Final internal controller for handling requests from the Brain and Watchdog subsystems.

const tryCatch = require('../utils/tryCatch');
const projectService = require('../services/projectService');
const messageService = require('../services/messageService');
const logService = require('../services/logService');
const agentHistoryService = require('../services/agentHistoryService');
const conversationService = require('../services/conversationService');
const { normalizeMessage } = require('../utils/normalize');
const settingsService = require('../services/settingsService');



// ─────────────────────────────────────────────
// Core Brain Functions
// ─────────────────────────────────────────────

/**
 * Returns the full context for a project:
 * project info, agents, conversations, summaries, and recent messages.
 */
const getBrainContext = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;

    // Fetch all necessary context in parallel
    const [
        projectDetails, 
        summaries, 
        conversations,
        recentMessages
    ] = await Promise.all([
        projectService.getProjectByIdInternal(projectId),
        agentHistoryService.getLatestSummaries(projectId),
        conversationService.getConversationsByProjectInternal(projectId),
        messageService.getAgentRecentMessages(projectId, null, 50)
    ]);

    if (!projectDetails) throw `Project with ID ${projectId} not found.`;

    // Attach summaries and message history to each agent
    projectDetails.agents.forEach(agent => {
        const summary = summaries.find(s => s.agent_id === agent.id);

        agent.summary = summary?.summary || null;
        agent.message_count = summary?.message_count || 0;
        agent.summary_count = summary?.summary_count || 0;
        agent.last_summary_at = summary?.updated_at || null;

        agent.history = recentMessages.filter(
            m => m.sender_id === agent.id || m.receiver_id === agent.id
        );
    });

    return {
        ...projectDetails,
        conversations,
    };
});

/**
 * Returns all pending messages for a project.
 */
const getPendingWorkQueue = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const messages = await messageService.getPendingMessages(projectId);
    return messages.map(normalizeMessage);
});

/**
 * Inserts a new agent-generated message.
 */
const createAgentMessage = (req, res) => tryCatch(res, async () => {
    const message = await messageService.createMessage(req.body);
    return normalizeMessage(message);
});

/**
 * Updates the status of a specific message.
 */
const updateMessageStatus = (req, res) => tryCatch(res, async () => {
    const { messageId } = req.params;
    const { status } = req.body;
    const result = await messageService.updateMessageStatus(messageId, status);
    return { success: !!result };
});

/**
 * Decreases the remaining message limit for the project.
 */
const decrementMessageLimit = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const result = await settingsService.decrementMessageLimit(projectId);
    return result;
});

/**
 * Increments the agent’s message count after a send.
 */
const incrementAgentMessageCount = (req, res) => tryCatch(res, async () => {
    const { projectId, agentId } = req.params;
    const result = await agentHistoryService.incrementMessageCount(projectId, agentId);
    return { success: true, newCount: result.message_count };
});

/**
 * Inserts a new system log entry.
 */
const createLogEntry = (req, res) => tryCatch(res, async () => {
    const newLog = await logService.insertLog(req.body);
    return { id: newLog.id };
});

/**
 * Saves a new summary for an agent.
 */
const createSummary = (req, res) => tryCatch(res, async () => {
    const newSummary = await agentHistoryService.saveSummary(req.body);
    return { id: newSummary.id };
});

/**
 * Retrieves the latest summary for a specific agent in a project.
 */
const getAgentSummary = (req, res) => tryCatch(res, async () => {
    const { projectId, agentId } = req.params;
    const summary = await agentHistoryService.getSummary(projectId, agentId);
    return summary || {};
});

/**
 * Retrieves all latest summaries for the project.
 */
const getProjectSummaries = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const summaries = await agentHistoryService.getLatestSummaries(projectId);
    return summaries;
});


// ─────────────────────────────────────────────
// Watchdog Functions
// ─────────────────────────────────────────────

/**
 * Returns a list of currently active projects.
 */
const getActiveProjects = (req, res) => tryCatch(res, async () => {
    return await projectService.getActiveProjects();
});

/**
 * Returns the oldest timestamp of any pending message.
 */
const getOldestPendingTimestamp = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const data = await messageService.getOldestPendingMessageTimestamp(projectId);
    return data || {};
});

/**
 * Pauses a project with a given code and optional message.
 */
const pauseProject = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const { code, message } = req.body;
    await projectService.pauseProjectInternal(projectId, code, message);
    return { success: true, message: `Project ${projectId} paused.` };
});


// ─────────────────────────────────────────────
// Handler Loop Support
// ─────────────────────────────────────────────

/**
 * Retrieves project flags (pause status, message limit).
 */
const getProjectFlags = (req, res) => tryCatch(res, async () => {
    const { projectId } = req.params;
    const flags = await projectService.getProjectFlags(projectId);
    return flags || { paused: true, message_limit: 0 };
});

/**
 * Gets recent messages involving a specific agent.
 * Query param: ?limit= (default 20)
 */
const getAgentRecentMessages = (req, res) => tryCatch(res, async () => {
    const { projectId, agentId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const messages = await messageService.getAgentRecentMessages(projectId, agentId, limit);
    return messages;
});

module.exports = {
    getBrainContext,
    getPendingWorkQueue,
    createAgentMessage,
    updateMessageStatus,
    decrementMessageLimit,
    incrementAgentMessageCount,
    createLogEntry,
    createSummary,
    getAgentSummary,
    getProjectSummaries,
    getActiveProjects,
    getOldestPendingTimestamp,
    pauseProject,
    getProjectFlags,
    getAgentRecentMessages
};
