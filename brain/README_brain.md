# Brain Service Documentation for "Tea Mi - Team AI"

## 🧠 Overview

The AI Brain is a sophisticated Python service built with FastAPI that acts as the core processing engine for the multi-agent AI platform. Its primary role is to perform on-demand, computationally intensive tasks, including orchestrating conversations between AI agents, managing their memory through summarization, and ensuring the health of active projects.

The Brain is designed to be a distinct, stateless microservice that communicates with the main Node.js backend via a secure internal REST API. It is triggered by "nudges" from the backend and operates in a loop to process all pending tasks for a given project before shutting down.

## 🚀 Key Features

- **On-Demand Task Processing**: The Brain activates upon receiving a `/nudge-brain` request, processes all tasks for a project, and then becomes idle.
- **Comprehensive Context Building**: On activation, it fetches a full project context—including agents, conversations, and summaries—to inform the AI's decisions.
- **Advanced Prompt Engineering**: Dynamically constructs detailed prompts for the LLM by combining project-level system prompts, agent-specific roles, conversation history, and context summaries.
- **Structured AI Responses**: Enforces a strict JSON schema on the OpenAI API's output to ensure reliable, parsable communication between agents.
- **Retry and Correction Logic**: If the AI fails to produce valid JSON, the system automatically injects a correction notice and retries up to a defined maximum number of attempts.
- **Automated Memory Summarization**: When an agent's message count reaches a threshold, it automatically triggers a summarization process to condense recent conversation history into a memory, keeping future prompts efficient.
- **Persistent Logging**: All significant events, errors, and warnings are sent back to the main backend for persistent storage in the database, enabling robust monitoring and debugging.
- **System Watchdog**: A separate, schedulable task (`watchdog.py`) monitors all active projects and automatically pauses any that are stalled or have been inactive for too long.

## 🧠 Memory & Prompt System

A core feature of the Brain service is its sophisticated approach to managing an agent's memory to provide relevant context for each completion. This system avoids sending the entire conversation history with every request, which would be inefficient and exceed token limits. Instead, it uses a hybrid approach combining long-term memory (summaries) and short-term memory (recent messages).

The process is orchestrated by `message_handler.py` and involves three key components:

1.  **Long-Term Memory (Automated Summarization):**
    - When an agent's message count reaches a certain threshold (defined by `SUMMARY_TRIGGER_THRESHOLD` in `constants.py`), the `summarizer.py` handler is triggered.
    - It fetches a block of recent messages and sends them to the OpenAI API with a specific prompt asking it to create a concise, third-person summary of the key facts, decisions, and outcomes from that conversation block.
    - This generated summary is then stored in the database, representing the agent's long-term memory of what has happened in the past.

2.  **Short-Term Memory (Dynamic Message Window):**
    - `message_handler.py` uses the agent's current message count to dynamically calculate how many recent messages to fetch, up to the `HISTORY_WINDOW_SIZE`.
    - This ensures that new agents have a smaller, more focused context, while established agents have a richer short-term memory.

3.  **Prompt Assembly (`prompt_builder.py`):**
    - Before calling the OpenAI API, the `prompt_builder.py` service assembles the final prompt from multiple sources in a specific order:
        1.  **Main System Prompt:** The overall project rules and the agent's specific role description.
        2.  **Long-Term Memory:** The latest stored summary is injected as a system message.
        3.  **Short-Term Memory:** The dynamically fetched recent messages are added.
        4.  **Trigger Message:** The final message that the agent needs to respond to.

This hybrid approach ensures the AI has both a high-level understanding of the entire history (via the summary) and a detailed, verbatim record of the most recent interactions.

## ⚙️ Operational Workflow

The Brain's core operational flow for a single project is a sophisticated pipeline:

1.  **Nudge Received**: The Node.js backend sends an HTTP POST request to the `/nudge-brain` endpoint with a `project_id`.
2.  **Runner Initiated**: The `runner.py` module begins processing for the given `project_id`.
3.  **Context Fetch & Decryption**: The `project_handler` makes an API call to the backend to get the complete project context and decrypts the associated OpenAI API key.
4.  **Processing Loop**: The handler enters a loop that continues as long as there are pending messages and the project is active.
5.  **Message Handling**: For each pending message, the `message_handler` is invoked.
6.  **Prompt Construction**: The `prompt_builder` service assembles a list of messages for the LLM.
7.  **LLM Interaction**: The `openai_service` sends the constructed prompt to the OpenAI API, enforcing a JSON schema.
8.  **Response Validation**: The `format_checker` attempts to parse the AI's JSON response, and the `message_handler` retries with a correction notice on failure.
9.  **Action & State Update**: Once a valid response is received, the `message_handler` sends the new message and updates all relevant data via the `api_client`.
10. **Summarization Trigger**: If an agent's message count exceeds the threshold, the `summarizer` is called.
11. **Loop or Exit**: The loop continues until no pending messages are left or a stop condition is met.

## 🛠️ Tech Stack

- **Language:** Python 3.11
- **Web Framework:** FastAPI
- **HTTP Client**: HTTPX
- **LLM Interaction**: OpenAI Python SDK
- **Cryptography**: PyCryptodome
- **Containerization**: Docker

## 📂 Project Structure

- **`main.py`**: The FastAPI server entry point. Defines the `/nudge-brain` API endpoint.
- **`runner.py`**: The top-level task orchestrator that initiates and logs the start/end of project processing.
- **`watchdog.py`**: A standalone script for monitoring and pausing inactive projects.
- **`handlers/`**: Core logic modules for processing tasks.
    - `project_handler.py`: Manages the lifecycle for a single project run.
    - `message_handler.py`: Orchestrates the processing of a single message.
    - `summarizer.py`: Handles agent memory summarization.
- **`services/`**: Modules for communicating with external services.
    - `api_client.py`: Centralized client for all HTTP requests to the Node.js backend.
    - `openai_service.py`: A robust wrapper for all interactions with the OpenAI API.
    - `prompt_builder.py`: Contains the logic for constructing complex prompts.
- **`utils/`**: Helper modules like `crypto.py` for decryption and `console_log.py` for logging.


## 🔑 Environment Variables

```env
BACKEND_API_URL=http://mybackend:5000/api
BRAIN_API_KEY=your_secret_brain_api_key
ENCRYPT_SECRET=a_very_secret_32_character_key_!
```

## 🧪 Setup & Running

### Installation
1.  Navigate to the `brain` directory.
2.  It is highly recommended to use a Python virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```
3.  Install the required dependencies from `requirements.txt`:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Service
The Brain can be run in two primary modes:

**1. Server Mode (Recommended for Production/Docker)**
This mode starts the FastAPI server, which listens for HTTP "nudges" from the backend.
```bash
python main.py
````

The server will be available at `http://0.0.0.0:8000`.

**2. Watchdog Mode (Run as a separate, scheduled task)**
This script runs a monitoring check and is intended to be executed periodically by a scheduler like Cron.

```bash
python watchdog.py
```


---

## 🚀 Deployment

This Brain service is deployed via **[Railway](https://railway.app/)** using two distinct services from the same repository:

| Service    | Type             | Start Command           | Description                                            |
|------------|------------------|--------------------------|--------------------------------------------------------|
| `brain`    | Web Service      | `python main.py`         | FastAPI server that listens for `/nudge-brain` calls   |
| `watchdog` | Scheduled Job    | `python watchdog.py`     | Cron-like job that scans for stalled projects          |

Environment variables (`.env`) are securely managed in the Railway dashboard and injected into both services.

All outbound requests from Brain and Watchdog go to the backend's internal API using these shared environment keys.

---

## 🌐 Hosted Architecture Overview

| Layer     | Platform                        |
|-----------|---------------------------------|
| Frontend  | [Vercel](https://vercel.com)    |
| Backend   | [Render](https://render.com)    |
| Database  | [Neon](https://neon.tech)       |
| Brain     | [Railway](https://railway.app)  |

---
