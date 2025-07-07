-- =============================================================================
-- === Core User and Authentication Tables
-- =============================================================================

-- USERS: Stores information about registered users.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,       -- User's login email, must be unique.
  password_hash TEXT NOT NULL,      -- The securely hashed password.
  username TEXT,                    -- A display name for the user.
  is_admin BOOLEAN DEFAULT FALSE,   -- Flag for administrative privileges.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TOKENS: Stores API tokens (e.g., for OpenAI) associated with users.
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- If the user is deleted, their tokens are also deleted.
  name TEXT NOT NULL,               -- A user-friendly name for the token (e.g., "My GPT-4 Key").
  api_key TEXT NOT NULL,            -- The encrypted API key itself.
  active BOOLEAN DEFAULT TRUE,      -- Allows for deactivating a token without deleting it.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- === Agent and Project Definition Tables
-- =============================================================================

-- AGENTS: Defines the reusable AI agent profiles created by users.
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- If the user is deleted, their agents are also deleted.
  name TEXT NOT NULL,               -- The unique name of the agent.
  role TEXT NOT NULL,               -- The agent's functional role (e.g., "Software Engineer").
  description TEXT NOT NULL,        -- A detailed description of the agent's personality and instructions.
  model TEXT NOT NULL,              -- The underlying LLM to be used (e.g., "gpt-4o").
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a global System Agent. This agent is not owned by any user (user_id is NULL)
-- and is used for system-level messages or actions.
-- ON CONFLICT DO NOTHING prevents errors if the script is run multiple times.
INSERT INTO agents (id, user_id, name, role, description, model)
VALUES (0, NULL, 'System', 'system', 'Internal system agent', 'System')
ON CONFLICT (id) DO NOTHING;


-- PROJECTS: The main container for a simulation or task involving multiple agents.
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- If the user is deleted, their projects are also deleted.
  title TEXT NOT NULL,              -- The title of the project.
  description TEXT,                 -- A brief description of the project's goals.
  system_prompt TEXT,               -- A high-level system prompt applied to all agents in the project.
  paused BOOLEAN DEFAULT TRUE,     -- A flag to start/stop all activity within the project.
  message_limit INTEGER DEFAULT 0,  -- A limit on the number of messages that can be sent.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Used by the watchdog to detect idle projects.
);


-- =============================================================================
-- === Bridge Tables (Many-to-Many Relationships)
-- =============================================================================

-- PROJECT_TOKENS: Links a project to a specific API token.
CREATE TABLE project_tokens (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE, -- If a project is deleted, this link is removed.
    token_id INTEGER REFERENCES tokens(id) ON DELETE SET NULL,     -- If the token is deleted, this field becomes NULL, indicating the project needs a new key.
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROJECT_AGENT_MEMBERS: Links agents to projects, defining their membership.
CREATE TABLE project_agent_members (
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE, -- If the project is deleted, the membership is removed.
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,   -- If the agent is deleted, the membership is removed.
  role TEXT,                  -- An optional project-specific role override for the agent.
  prompt TEXT,                -- An optional project-specific prompt addition for the agent.
  thread_id TEXT,             -- Potentially for external integrations (e.g., OpenAI Assistants).
  can_message_ids TEXT,       -- Potentially for defining explicit communication channels.
  PRIMARY KEY (project_id, agent_id) -- Ensures an agent can only be in a project once.
);


-- =============================================================================
-- === Communication and Logging Tables
-- =============================================================================

-- CONVERSATIONS: Defines a unique communication channel between two agents within a project.
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensures only one conversation exists for any pair of agents within a single project.
  UNIQUE (project_id, sender_id, receiver_id),

  -- A clever constraint to prevent duplicate conversations with swapped IDs.
  -- e.g., prevents having both (agent1, agent2) and (agent2, agent1).
  -- All application logic must ensure it inserts IDs in the correct sorted order.
  CHECK (sender_id <= receiver_id)
);

-- MESSAGES: Stores every message sent between agents.
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE, -- If the conversation is deleted, so are its messages.
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL,       -- The ID of the sending agent.
  receiver_id INTEGER,              -- The ID of the receiving agent (can be NULL for broadcasts).
  type TEXT DEFAULT 'user',         -- The type of message (e.g., 'user', 'assistant', 'system').
  status TEXT DEFAULT 'sent',       -- The status of the message (e.g., 'pending', 'sent', 'failed').
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGS: A dedicated table for system and application logs for monitoring and debugging.
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE, -- Associates a log with a project.
  level TEXT NOT NULL DEFAULT 'error', -- The severity of the log (e.g., 'error', 'warn', 'info').
  message TEXT NOT NULL,               -- The main content of the log entry.
  code TEXT,                           -- An optional machine-readable code (e.g., 'TOKEN_EXHAUSTED').
  created_at TIMESTAMP DEFAULT NOW()
);

-- AGENT_HISTORY_SUMMARIES: Stores the condensed memory for each agent in each project.
CREATE TABLE agent_history_summaries (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  
  summary TEXT NOT NULL,              -- The last generated summary of the agent's conversation history.
  history_json JSONB,                 -- Optionally stores the raw messages used to generate the last summary.
  message_count INTEGER DEFAULT 0,    -- The number of messages sent by the agent since the last summary.
  summary_count INTEGER DEFAULT 0,    -- A counter for the total number of summaries created for this agent.

  updated_at TIMESTAMP DEFAULT now(), -- The timestamp of the last summarization.
  UNIQUE(agent_id, project_id)        -- Ensures each agent has only one memory summary per project.
);
