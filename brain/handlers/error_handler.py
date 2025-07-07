# FILE: brain/handlers/error_handler.py
# Purpose: Centralized handler for logging and managing errors within the brain service.

from debug_flags import debug_error_handler as debug
from services.logger_service import log_to_db, log_console

async def handle_error(message: dict, error: Exception) -> None:
    """
    Handles and logs errors encountered during message processing.

    Extracts relevant message details and logs the error to both console (if debug enabled)
    and persistently to the backend database.

    Args:
        message (dict): The message object that caused the error.
        error (Exception): The exception object caught.
    """
    project_id: int | None = message.get("project_id")
    message_id: int | None = message.get("id")
    sender_id: int | None = message.get("sender_id")
    receiver_id: int | None = message.get("receiver_id")
    message_body: str = message.get("content", "")[:200]  # Truncate long body.
    attempts: int = message.get("attempts", 1)

    # Log to console for immediate visibility during development/monitoring.
    if debug:
        log_console(f"❌ [Brain Error] message_id={message_id} project_id={project_id} (attempt {attempts})")
        log_console(f"   Error: {error}", level="error")

    # Log to the backend database for persistent error tracking, if project_id is available.
    if project_id:
        await log_to_db(
            project_id,
            message=(
                f"Unhandled error while processing message {message_id} "
                f"(sender {sender_id} → receiver {receiver_id}, attempt {attempts}):\n"
                f"{str(error)}\n"
                f"Message preview: {message_body}"
            ),
            level="error",
            code="UNHANDLED_EXCEPTION"
        )