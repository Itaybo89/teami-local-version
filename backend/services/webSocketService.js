// FILE: backend/services/webSocketService.js

const { WebSocket } = require('ws');

const clients = new Map();
const pendingMessages = new Map();
let wss;

/**
 * 🌐 Initializes the WebSocket server and sets up connection handling.
 */
const initialize = (webSocketServer) => {
  wss = webSocketServer;

  wss.on('connection', (ws, request) => {
    const userId = request.user?.id;
    if (!userId) {
      console.error('❌ WebSocket connected without user.');
      ws.close();
      return;
    }
    console.log(`🔗 WebSocket CONNECTED: user ${userId}`);

    ws.on('message', (message) => {
      console.log(`📥 WebSocket RECEIVED: ${message}`);
      try {
        const data = JSON.parse(message);
        if (data.type === 'join' && data.projectId) {
          clients.set(ws, { projectId: data.projectId, userId });
          console.log(`🔔 User ${userId} joined project ${data.projectId}`);

          if (pendingMessages.has(data.projectId)) {
            const queue = pendingMessages.get(data.projectId);
            console.log(`📨 Sending ${queue.length} queued message(s) to user ${userId}`);
            queue.forEach((msgString) => {
              if (ws.readyState === WebSocket.OPEN) ws.send(msgString);
            });
            pendingMessages.delete(data.projectId);
          }
        }
      } catch (e) {
        console.error('💥 Error parsing WebSocket message:', e);
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket DISCONNECTED: user ${userId}`);
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('⚠️ WebSocket ERROR:', error);
    });
  });

  console.log('✅ WebSocket service initialized and listening.');
};

/**
 * 📢 Broadcasts a message to all connected clients in a given project.
 * If no clients are connected, message is queued.
 */
const broadcastToProject = (projectId, message) => {
  const messageString = JSON.stringify(message);
  const projectClients = [...clients.entries()].filter(([_, c]) => c.projectId === projectId);

  if (projectClients.length === 0) {
    console.log(`🕒 No active clients for project ${projectId}, queuing message.`);
    if (!pendingMessages.has(projectId)) pendingMessages.set(projectId, []);
    pendingMessages.get(projectId).push(messageString);
  } else {
    console.log(`📤 Broadcasting to ${projectClients.length} client(s) in project ${projectId}.`);
    projectClients.forEach(([ws]) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(messageString);
    });
  }
};

module.exports = {
  initialize,
  broadcastToProject,
};
