
-----

# **Project: Tea Mi - Team AI**

This document provides a complete guide to the "Tea Mi" Multi-Agent AI Platform. It is a full-stack application designed to create, manage, and observe collaborative projects carried out by teams of AI agents.

## **1. Overview**

The platform allows users to define projects, assign teams of specialized AI agents (e.g., "React Developer," "Team Lead"), and provide them with high-level goals. The agents then communicate and work together autonomously to complete tasks, with their interactions and progress visible to the user in real-time.

The system is architected as a set of three distinct but interconnected services:

  * **Frontend**: A modern React SPA that provides the user interface for all management and observation tasks.
  * **Backend**: A Node.js/Express server that acts as the central API, managing users, data persistence, and real-time communication.
  * **Brain**: A headless Python/FastAPI service that performs all the heavy AI processing, including prompt engineering, LLM interaction, and agent memory management.

## **2. Tech Stack**

The project utilizes a modern, polyglot technology stack:

| Component | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, React Router, TanStack Query, Axios |
| **Backend** | Node.js, Express, PostgreSQL, WebSockets, JWT |
| **AI Brain** | Python, FastAPI, OpenAI SDK, HTTPX |
| **Database** | PostgreSQL |
| **Containerization** | Docker, Docker Compose |

## **3. System Architecture**

The services are designed to communicate in a clear, directional flow, orchestrated by Docker Compose.

```
+----------------+      +------------------+      +----------------+
|                |      |                  |      |                |
|    Frontend    |<---->|     Backend      |----->|     Brain      |
| (React @ 5173) |      | (Node.js @ 5000) |      | (Python @ 8000)|
|                |      |                  |      |                |
+-------+--------+      +--------+---------+      +-------+--------+
        |                        |                         |
        | (WebSocket)            | (SQL)                   | (OpenAI API)
        |                        |                         |
        +------------------------+-------------------------+
                                 |
                         +-------+--------+
                         |                |
                         |   PostgreSQL   |
                         |      (DB)      |
                         |                |
                         +----------------+
```

1.  **User -\> Frontend**: The user interacts with the React application in their browser.
2.  **Frontend \<-\> Backend**: The frontend communicates with the backend via a REST API for data (e.g., fetching projects) and a WebSocket connection for real-time updates.
3.  **Backend -\> Brain**: When a project requires AI processing, the backend sends an HTTP "nudge" to the Brain service's `/nudge-brain` endpoint.
4.  **Brain -\> Backend**: The Brain communicates back to the backend's secure `/api/internal` endpoints to fetch context, update messages, and log events.
5.  **Backend -\> Database**: The backend is the only service that directly interacts with the PostgreSQL database for all data persistence.
6.  **Brain -\> OpenAI**: The Brain is the only service that communicates with the external OpenAI API.

## **4. Getting Started (Docker)**

The easiest and recommended way to run the entire application stack is with Docker and Docker Compose. This ensures all services and the database are configured correctly to work together.

### **Prerequisites**

  * [Docker](https://www.docker.com/products/docker-desktop/) installed and running.

### **Setup Instructions**

1.  **Clone the Repository**:
    Clone this project to your local machine.

2.  **Create the Environment File**:
    In the root directory of the project, create a file named `.env`. Copy the contents of the `.env.example` file (or the content below) into it.

3.  **Run Docker Compose**:
    Open a terminal in the project's root directory and run the following command:

    ```bash
    docker-compose up --build
    ```

    To run in the background (detached mode), use:

    ```bash
    docker-compose up --build -d
    ```

    This command will:

      * Build the Docker images for the `frontend`, `backend`, and `brain` services based on their respective Dockerfiles.
      * Start containers for all services, including the PostgreSQL database.
      * Initialize the database with the schema from `schema.sql` on the first run.

4.  **Access the Application**:

      * **Frontend**: Open your browser and navigate to `http://localhost:5173`
      * **Backend API**: Accessible at `http://localhost:5000`
      * **Brain API**: Accessible at `http://localhost:8000`

## **5. Environment Variables**

Create a `.env` file in the project root. This single file provides configuration for all services when running with Docker Compose.

```env
# === PostgreSQL Database Configuration ===
# Credentials used by the 'db' service in docker-compose.yml to initialize.
# The backend service will also use these to connect.
DB_HOST=db
DB_PORT=5432
DB_DATABASE=mydatabase
DB_USER=myuser
DB_PASSWORD=mypassword

# === Backend (Node.js) Configuration ===
# Port for the backend Express server.
PORT=5000
# URL of the frontend for CORS policy.
CORS_ORIGIN=http://localhost:5173
# Secret for signing JWTs. Use a long, random string.
JWT_SECRET=your_super_secret_jwt_string
# 32-character key for encrypting/decrypting API keys.
ENCRYPT_SECRET=a_very_secret_32_character_key_!

# === Brain (Python) Configuration ===
# The internal URL the backend uses to "nudge" the brain.
# The hostname 'brain' matches the service name in docker-compose.yml.
BRAIN_API_URL=http://brain:8000
# A shared secret API key to protect the brain's internal API endpoints.
BRAIN_API_KEY=your_secret_brain_api_key

# === Demo & Snapshot Project Configuration ===
# These IDs are used by both the backend and frontend to enable special
# behavior for demo projects (e.g., preventing deletion).
DEMO_USER_ID=1
DEMO_TOKEN_ID=2
DEMO_PROJECT_ID=2
SNAPSHOT_PROJECT_ID=1
DEMO_PROJECT_LIMIT=20
```

## **6. Database**

The application uses a PostgreSQL database. The complete database schema is defined in the `/schema/schema.sql` file. This file is automatically executed by the `db` service in Docker Compose on its first run to create all necessary tables, including `users`, `projects`, `agents`, `messages`, and `logs`.

When running with Docker, the database data is persisted in a named volume (`db-data`) to prevent data loss when containers are stopped and started.

## **7. Manual Setup (Without Docker)**

If you prefer to run each service manually, follow the instructions in their respective README files:

  * **[Backend README](https://github.com/Itaybo89/Teami_Local_Version/blob/main/backend/README_backend.md)**
  * **[Frontend README](https://github.com/Itaybo89/Teami_Local_Version/blob/main/frontend/README_frontend.md)**
  * **[Brain README](https://github.com/Itaybo89/Teami_Local_Version/blob/main/brain/README_brain.md)**


**Note**: When running services manually, you will need to manage dependencies, environment variables (especially API and database URLs), and service startup order yourself. For example, you must ensure the PostgreSQL database is running before starting the backend.