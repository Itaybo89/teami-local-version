# FILE: brain/handlers/format_checker.py
# Purpose: Parses and validates the structured JSON reply from the AI assistant.

from debug_flags import debug_format_checker as debug
import json
from utils.console_log import log_console

REQUIRED_KEYS = ["from", "to", "body"]

def parse_assistant_reply(reply: str) -> dict | None:
    """
    Parses a structured JSON assistant reply string into a dictionary.

    Expected format:
    {
      "from": "<sender name>",
      "to": "<recipient name>",
      "body": "<message content>"
    }

    Args:
        reply (str): The raw string reply from the assistant.

    Returns:
        dict | None: A dictionary with 'from', 'to', and 'content' keys if valid, otherwise None.
    """
    if not reply or not isinstance(reply, str):
        log_console("⚠️ Assistant reply is missing or not a string", debug_flag=debug)
        return None

    try:
        data: dict = json.loads(reply)
        if not all(key in data for key in REQUIRED_KEYS):
            log_console(f"❌ Missing required keys in assistant reply: {data}", debug_flag=debug)
            return None

        result: dict = {
            "from": data["from"].strip(),
            "to": data["to"].strip(),
            "content": data["body"].strip()
        }

        log_console(f"✅ Parsed assistant reply: from={result['from']} to={result['to']}", debug_flag=debug)
        return result

    except json.JSONDecodeError as e:
        log_console(f"❌ JSON decode error in assistant reply: {e}", debug_flag=debug)
    except Exception as e:
        log_console(f"❌ Unexpected parsing error in assistant reply: {e}", debug_flag=debug)

    return None