# FILE: brain/services/conversation_service.py
# Purpose: Manages conversation-related checks and ensures their existence.

from debug_flags import debug_conversation_service as debug
from services.db.conversations import get_conversation_id
from services import logger_service # Use the centralized logger service
from utils.console_log import log_console

async def ensure_conversation_exists(project_id: int, sender_id: int, receiver_id: int) -> int | None:
    """
    Checks if a conversation exists between two agents for a given project.
    Logs a warning if the conversation is missing.

    Args:
        project_id (int): The ID of the project.
        sender_id (int): The ID of the sending agent.
        receiver_id (int): The ID of the receiving agent.

    Returns:
        int | None: The conversation ID if found, otherwise None.
    """
    log_console(f"🔎 Checking conversation between {sender_id} → {receiver_id} in project {project_id}", debug_flag=debug)
    
    conversation_id = await get_conversation_id(project_id, sender_id, receiver_id)
    
    if conversation_id is None:
        log_console(f"❌ No conversation found between agents {sender_id} and {receiver_id} in project {project_id}", debug_flag=debug)
        await logger_service.log_to_db( # Use logger_service for persistent logging
            project_id,
            f"Missing shared conversation for agents {sender_id} and {receiver_id}",
            level="warn", # Changed level to warn for operational visibility, not error as it might be recoverable or expected in some flows.
            code="MISSING_CONVERSATION"
        )
    else:
        log_console(f"✅ Conversation found: {conversation_id}", debug_flag=debug)
    
    return conversation_id