// FILE: backend/server.js

console.log('🟢 server.js file is executing');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { WebSocketServer } = require('ws');

const { port, nodeEnv } = require('./env');
const { verifyToken } = require('./utils/auth/jwt');
const webSocketService = require('./services/webSocketService');

// Route modules
const authRoutes = require('./routes/authRoutes');
const agentRoutes = require('./routes/agentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const logRoutes = require('./routes/logRoutes');
const internalRoutes = require('./routes/internalRoutes');

// Initialize Express
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Attach REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/internal', internalRoutes);

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.send(`Server running in ${nodeEnv} mode`);
});

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
webSocketService.initialize(wss);

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  console.log('⬆️ Received HTTP upgrade request for WebSocket');

  cookieParser()(request, {}, () => {
    const token = request.cookies?.token;

    if (!token) {
      console.log('❌ No token found in upgrade request, closing socket');
      socket.destroy();
      return;
    }

    try {
      const decoded = verifyToken(token);
      request.user = { id: decoded.userId };
      console.log(`✅ Token verified for user: ${decoded.userId}`);

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch (err) {
      console.error('❌ JWT verification failed during upgrade:', err);
      socket.destroy();
    }
  });
});

// Start HTTP + WebSocket server
server.listen(port, () => {
  console.log(`🚀 HTTP & WebSocket server running on http://localhost:${port}`);
});
