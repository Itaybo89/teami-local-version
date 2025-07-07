# FILE: brain/constants.py
# Purpose: Defines immutable application-wide constants used across the AI Brain service.

from debug_flags import debug_constants as debug #

# Retry Logic
MAX_RETRIES = 3

# Summarization
SUMMARY_TRIGGER_THRESHOLD = 10
MAX_SUMMARY_TOKENS = 512

# Model Defaults
DEFAULT_MODEL = "gpt-4o"

# Prompt Tags
SYSTEM_ROLE_TAG = "[AGENT ROLE]"

# Project Pause Reasons & Notices
PROJECT_NOTICE_LIMIT = "Message limit reached. Project paused."

# LLM Format Correction Notices
BREACH_NOTICE = """Your previous message was not valid JSON and did not match the required format.

Please reply using **exactly** this structure (as a real JSON object):

{
  "from": "Your name",
  "to": "Recipient name",
  "body": "Your message content"
}

- Do not include Markdown or code blocks
- Only return one JSON object — nothing else
- Avoid extra text or formatting
"""

FFORMAT_RULES = """
Respond using this strict JSON format:
{ 
  "from": "<your name>",
  "to": "<recipient name>",
  "body": "<message content>"
}
Rules:
- Return a single raw JSON object
- No markdown, comments, or extra formatting
- The object must be valid JSON
"""

INVALID_AGENT_NOTICE = """
[SYSTEM CORRECTION]: Your previous message contained an invalid agent name.
The 'from' name must be your own assigned name, and the 'to' name must be one of the agents in this project.

Invalid name detected: '{invalid_name}'
Please correct the agent name in your JSON response and choose from the available agents: {valid_agent_names}.

Resubmit your response with a valid agent name in the 'from' and 'to' fields.
"""

# Message History Window
HISTORY_WINDOW_SIZE = 14
MINIMUM_WINDOW_SIZE = 5

# Project Handler Limits
MAX_PROJECT_HANDLER_ITERATIONS = 100