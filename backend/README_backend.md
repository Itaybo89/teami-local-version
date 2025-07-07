# Backend Application Documentation

## 🧠 Overview

This document outlines the architecture, features, and API endpoints for the backend system. It is a robust Node.js application built with Express, supporting a multi-agent conversational platform.

The backend handles user authentication, project/agent management, real-time messaging, and inter-service communication with the Python Brain. It’s built using a modular structure separating concerns into routing, controllers, services, and utilities.

---

### 🔧 Core Technologies

- **Framework:** Express.js
- **Database:** PostgreSQL (`pg-promise`)
- **Auth:** JWT (in HTTP-only cookies)
- **WebSocket:** `ws`
- **Validation:** Zod
- **Hashing:** bcrypt
- **API Communication:** Axios → Python Brain

---

## 🚀 Features

- **Auth System:** Secure registration/login with JWT & bcrypt.
- **Projects:** Manage multiple AI agent projects.
- **Agents:** Create/manage AI agents with role/model/description.
- **Tokens:** Encrypted API key storage + status control.
- **Conversations:** Real-time user ↔ agent messaging.
- **Project Settings:** Assign token, pause, or set message limits.
- **System Logging:** Persistent log records per project.
- **Brain Integration:** Fetch context, manage memory, send messages.
- **Watchdog Support:** Auto-pause inactive/stalled projects.
- **Data Normalization:** Consistent response structure.

---

## 🧠 The Nudge System

The **"nudge" system** is how the backend activates the Python-based Brain AI service.

- **Definition:** A "nudge" is a backend→Brain POST to `/nudge-brain`, triggered by `nudgeBrain()` in `brainService.js`.
- **When Triggered:** Immediately after a user message is saved (within `createMessage()` in `messageService.js`).
- **Why:** The Brain is stateless and runs on-demand. Nudging it efficiently wakes up processing for a given project.

---

## 📂 Project Structure

```
backend/
├── config/            # DB connection, constants, env loader
├── controllers/       # Route handlers
├── middleware/        # Auth + validation
├── routes/            # All REST API endpoints
├── services/          # Core business logic
├── utils/             # Helpers (normalize, JWT, crypto)
│   └── auth/          # Security-specific utils
├── server.js          # App entry (Express + WebSocket)
├── package.json       # Project config
└── env.js             # Environment loader
```

---

## 📡 API Endpoints

All routes under `/api`. Auth required unless noted.

### 🔐 Auth

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| POST | `/register` | Register user |
| POST | `/login` | Log in |
| POST | `/logout` | Log out |
| GET  | `/me` | Current user |

### 📁 Projects

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/` | List projects |
| POST | `/` | Create project |
| GET | `/:id` | Get project |
| DELETE | `/:id` | Delete project |
| POST | `/:id/status` | Pause/resume |

### 👤 Agents

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/` | List agents |
| POST | `/` | Create agent |

### 🔑 Tokens

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/` | List tokens |
| POST | `/` | Add token |
| DELETE | `/:id` | Delete |
| PATCH | `/:id/disable` | Disable token |
| PATCH | `/:id/enable` | Enable token |

### 💬 Conversations

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/:projectId` | Get convos |
| POST | `/:projectId` | Start convo |

### 📨 Messages

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/:conversationId` | Get messages |
| POST | `/:conversationId` | Send message |

### 📝 Logs

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| GET | `/:projectId` | Get logs |
| DELETE | `/:projectId` | Clear logs |

### ⚙️ Settings

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| PATCH | `/project/:id/token` | Assign token |
| PATCH | `/project/:id/pause` | Pause/resume |
| PATCH | `/project/:id/limit` | Set limit |

### 🧠 Internal

> Protected by `X-Brain-Api-Key`. Used by the Python Brain for queue/context/memory ops.

---

## 🔐 Environment Variables

```env
DB_HOST=...
DB_PORT=...
DB_DATABASE=...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=...
ENCRYPT_SECRET=...
PORT=...
CORS_ORIGIN=...
BRAIN_API_KEY=...
BRAIN_API_URL=...
DEMO_USER_ID=...
DEMO_TOKEN_ID=...
DEMO_PROJECT_ID=...
SNAPSHOT_PROJECT_ID=...
DEMO_PROJECT_LIMIT=...
```

---

## 🧪 Setup & Running

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Create `.env`** in the project root with the variables above.

3. **Start the server**
```bash
npm start
```

Runs at `http://localhost:[PORT]`


---

### 🚀 Deployment

This backend is deployed via **[Render](https://render.com/)** using GitHub integration.

- Render automatically pulls and deploys from the `main` branch of the `teami-backend` repository.
- Environment variables are configured via the Render dashboard.
- The backend exposes both REST API endpoints and WebSocket support.
- It connects to a cloud-hosted PostgreSQL database on **[Neon](https://neon.tech)**.
- Communication with the AI "Brain" service is handled via secure API calls.

📦 Deployed URL: _[https://teami-backend.onrender.com](#)_ ← *(replace with your actual URL)*

---

### 🌐 Hosted Architecture Overview

| Layer     | Platform           |
|-----------|--------------------|
| Frontend  | [Vercel](https://vercel.com) |
| Backend   | [Render](https://render.com) |
| Database  | [Neon](https://neon.tech) |
| Brain     | [Railway](https://railway.app) |

---