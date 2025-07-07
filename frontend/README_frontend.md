# Frontend Application Documentation

## 🧠 Overview

This document provides a comprehensive guide to the frontend application, a modern React-based single-page application (SPA). It provides a rich, interactive user interface for managing AI agents, projects, conversations, and settings.

The architecture emphasizes a strong separation of concerns, utilizing a modular structure of components, hooks, services, and contexts to create a maintainable and scalable codebase.

---

## 🛠️ Core Technologies & Libraries

- **Framework:** React
- **Build Tool:** Vite
- **Routing:** React Router
- **Data Fetching & State Management:** TanStack Query (React Query)
- **HTTP Client:** Axios
- **Real-time Communication:** Native WebSocket API
- **UI Notifications:** React Toastify
- **Styling:** CSS Modules & Global CSS

---

## 🚀 Key Features

- **User Authentication:** Secure login, registration, and session management.
- **Project Management:** Create, view, and delete collaborative AI projects.
- **Agent Library:** A centralized place to view all user-created AI agents.
- **API Token Management:** Securely add, manage, and assign API tokens to projects.
- **Real-time Workspace:** Live updates for messages and logs via WebSockets.
- **Dynamic UI:** Built with reusable components and schema-driven tables.
- **Demo Mode:** Read-only "snapshot" mode to showcase demo projects.

---

## 🧩 Architectural Patterns

### 📦 State Management

- **React Query**: Manages all **server state** through data fetching and caching.
- **React Context**: Manages **global UI state** like auth and WebSocket connection.
- **useState**: Used for **local UI state** (e.g. modals, inputs).

### 🔄 Data Flow

1. **Component** calls a custom hook.
2. **Hook** uses a service function (e.g. via Axios).
3. **Service** fetches data and passes it through `normalize`.
4. **Hook** returns normalized data and query state.
5. **UI** updates automatically using React Query cache invalidation.

---

## 📂 Project Structure

```
/src
├── App.jsx             # App entry and routes
├── main.jsx            # React entry point
├── index.css           # Global styles
│
├── components/
│   ├── auth/           # Login/Register
│   ├── common/         # Buttons, Dialogs, etc.
│   ├── layout/         # Sidebar, TopBar
│
├── context/            # React contexts (Auth, Socket)
│
├── hooks/              # React Query + logic per domain
│
├── pages/              # Page components (routes)
│
├── schemas/            # Table and UI config
│
├── services/           # Axios API functions
│
├── templates/          # Project templates
│
└── utils/              # Formatters, error handling, etc.
```

---

## 🔧 Setup & Running

1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file** in `frontend` with:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WEBSOCKET_URL=ws://localhost:5000

VITE_DEMO_TOKEN_ID=2
VITE_DEMO_PROJECT_IDS=2,8
VITE_SNAPSHOT_PROJECT_ID=2
VITE_DEMO_PROJECT_LIMIT=20
```

4. **Start the development server:**
```bash
npm run dev
```

Runs on `http://localhost:5173`.

---

### 🧪 Local Development

To run the frontend locally:

```bash
# 1. Install dependencies
npm install

# 2. Create .env file in the root of /frontend
cp .env.example .env
```

Example `.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WEBSOCKET_URL=ws://localhost:5000

VITE_DEMO_USER_ID=2
VITE_DEMO_TOKEN_ID=2
VITE_DEMO_PROJECT_IDS=1,2
VITE_SNAPSHOT_PROJECT_ID=1
VITE_DEMO_PROJECT_LIMIT=20
```

```bash
# 3. Run the dev server
npm run dev
# Open http://localhost:5173
```

---

### 🚀 Deployment

This frontend is deployed via **[Vercel](https://vercel.com/)** using GitHub integration.

- Vercel automatically builds the app from the `main` branch
- The build uses the Vite framework preset
- Environment variables are configured via the Vercel dashboard

📦 Deployed URL: _[https://teami-frontend.vercel.app](#)_ (replace with your real one)

---

### 🌐 Hosted Architecture Overview

| Layer     | Platform           |
|-----------|--------------------|
| Frontend  | [Vercel](https://vercel.com) |
| Backend   | [Render](https://render.com) |
| Database  | [Neon](https://neon.tech) |
| Brain     | [Railway](https://railway.app) |

---
