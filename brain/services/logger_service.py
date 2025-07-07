# FILE: brain/services/logger_service.py
# Purpose: Centralized service for sending structured log entries to the backend API.

from services import api_client
from utils.console_log import log_console
from debug_flags import debug_logger_service as debug

async def log_to_db(project_id: int, message: str, level: str = "error", code: str | None = None) -> None:
    """
    Sends a structured log entry to the backend via the API client.

    This function acts as the standard logging utility for persistent, database-stored logs.
    It replaces direct database insertions. If the API call to the backend fails, it falls
    back to logging the error and the original message to the console to prevent the log
    from being lost entirely.

    Args:
        project_id (int): The ID of the project this log is associated with.
        message (str): The main content of the log message.
        level (str, optional): The log severity (e.g., 'info', 'warn', 'error'). Defaults to "error".
        code (str | None, optional): An optional machine-readable code (e.g., 'TOKEN_EXHAUSTED'). Defaults to None.
    """
    try:
        log_console(f"Logger: Sending log to backend for project {project_id}", debug_flag=debug)
        
        payload = {
            "projectId": project_id,
            "message": message,
            "level": level,
            "code": code
        }
        
        await api_client.create_log_entry(payload)

    except Exception as e:
        # CRITICAL FALLBACK: If API logging fails, log to console to prevent data loss.
        log_console(f"CRITICAL: Failed to send log to backend API. Error: {e}", level="error")
        log_console(f"Original Log Message: [Project {project_id}] [{level.upper()}] {message}", level="error")