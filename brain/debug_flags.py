# FILE: brain/debug_flags.py
# Purpose: Centralized control for enabling/disabling detailed debug logging across the AI Brain service.

# === 🧠 Core ===
debug_main = True
debug_runner = True
debug_config = False
debug_constants = False

# === 🧠 Cache ===
debug_project_context_cache = False

# === 🧠 Handlers ===
debug_message_handler = False  # Enable to log the message handling process
debug_project_handler = True
debug_format_checker = False
debug_error_handler = False
debug_summarizer = False  # Enable to see summarized context and prompts

# === 🧠 Services ===
debug_openai_service = False  # Enable to log the prompt sent to OpenAI
debug_conversation_service = False
debug_logger_service = True

# === 🧠 DB Services ===
debug_agents = False
debug_conversations = False
debug_logs = False
debug_messages = False  # Enable to log message-specific actions (such as insertions)
debug_projects = False
debug_tokens = False
debug_db_init = False

# === 🧠 Utils ===
debug_console_log = True  # Enable to see general debug logs
debug_crypto = False
debug_retry = False
debug_time = False

# === 🛡️🐕 Watchdog ===
debug_watchdog = False