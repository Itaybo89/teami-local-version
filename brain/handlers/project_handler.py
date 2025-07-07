# FILE: brain/handlers/project_handler.py
# Purpose: Core handler for processing all pending tasks within a single project.
# This module orchestrates fetching messages, processing them via message_handler,
# and managing the project's task queue.

from debug_flags import debug_project_handler as debug
import json # Not explicitly used in this snippet but often for context/config
from utils.console_log import log_console
from constants import MAX_PROJECT_HANDLER_ITERATIONS
from handlers.message_handler import handle_message
from services import api_client # Still needed for non-logging API calls
from services import logger_service # Import the dedicated logger service
from utils.crypto import decrypt_token

async def handle_project(project_id: int) -> None:
    """
    Handles all pending tasks for a project. Fetches initial context,
    then loops to continually check project status and process messages.

    Args:
        project_id (int): The unique identifier for the project to process.
    """
    # Log handler startup to console for immediate feedback.
    log_console(f"🧠 Project handler starting for project {project_id}", debug_flag=debug)
    # Log to logger_service at debug level as it's internal initiation.
    await logger_service.log_to_db(
        project_id,
        f"Project handler initiated for project {project_id}.",
        level="debug",
        code="PROJECT_HANDLER_START"
    )

    try:
        # Fetch the initial, comprehensive project context.
        project_context = await api_client.get_brain_context(project_id)
        
        if not project_context:
            log_console(f"⚠️ Could not fetch context for project {project_id}. Exiting handler.", level="warn")
            await logger_service.log_to_db( # Log for persistent record
                project_id,
                f"Project handler aborted: Could not fetch initial context for project {project_id}.",
                level="warn",
                code="CONTEXT_FETCH_FAILED"
            )
            return

        # Decrypt the OpenAI API key.
        encrypted_api_key = project_context.get("apiKey")
        decrypted_api_key: str | None = None
        if encrypted_api_key:
            try:
                decrypted_api_key = decrypt_token(encrypted_api_key)
            except Exception as e:
                # Log critical decryption failure, pause project, and exit.
                log_message = f"Project paused. Failed to decrypt API key: {e}"
                log_console(f"❌ {log_message}", level="error", debug_flag=True)
                await logger_service.log_to_db( # Log for persistent record
                    project_id,
                    log_message,
                    level="error",
                    code="DECRYPTION_FAILURE"
                )
                await api_client.pause_project(project_id, "DECRYPTION_FAILURE")
                return
        
        project_context["api_key"] = decrypted_api_key
        
        # Build helper maps from the initial context for efficient lookups.
        agents_list: list = project_context.get("agents", [])
        agents_map: dict = {agent['id']: agent for agent in agents_list}
        project_context['agents'] = agents_map
        project_context['name_to_id'] = {data["name"]: aid for aid, data in agents_map.items()}
        project_context['id_to_name'] = {aid: data["name"] for aid, data in agents_map.items()}
        
        conversations_list: list = project_context.get("conversations", [])
        conversation_map: dict = {}
        for conv in conversations_list:
            key = tuple(sorted((conv["sender_id"], conv["receiver_id"])))
            conversation_map[key] = conv["id"]
        project_context['conversations'] = conversation_map

        log_console(f"🧠 Context built for project {project_id}: {len(agents_map)} agents, {len(conversation_map)} conversations", debug_flag=debug)
        await logger_service.log_to_db( # Log context building details at debug level.
            project_id,
            f"Context built: {len(agents_map)} agents, {len(conversation_map)} conversations.",
            level="debug",
            code="CONTEXT_BUILD_SUCCESS"
        )


        # Main processing loop.
        iteration = 0
        while iteration < MAX_PROJECT_HANDLER_ITERATIONS:
            iteration += 1

            # Check project status and message limit at the start of each iteration.
            flags: dict = await api_client.get_project_flags(project_id)
            project_context["project_flags"] = flags

            # --- FIX: Check for both paused status and active token status ---
            is_paused = flags.get("paused", False)
            is_token_active = flags.get("is_token_active", False) # This key must be provided by the /flags API endpoint.

            if is_paused or not is_token_active:
                log_message = f"Project {project_id} handler terminating loop."
                if is_paused:
                    log_message += " Reason: Project is paused."
                if not is_token_active:
                    log_message += " Reason: Assigned token is inactive or missing."
                
                log_console(f"⏸️ {log_message}")
                
                # If the project isn't already paused (i.e., it was stopped due to an inactive token), pause it now.
                if not is_paused:
                    await api_client.pause_project(project_id, "TOKEN_INACTIVE_OR_MISSING")
                
                break # Exit the while loop.
            # --- END FIX ---

            current_limit: int | None = flags.get("message_limit")
            if current_limit is not None and current_limit <= 0:
                log_console(f"🚫 Project {project_id} has reached its message limit. Terminating processing loop.")
                await logger_service.log_to_db(
                    project_id,
                    "Project reached message limit. Handler terminating processing loop.",
                    level="warn",
                    code="MESSAGE_LIMIT_REACHED"
                )
                break

            pending_messages: list = await api_client.get_pending_messages(project_id)
            if not pending_messages:
                log_console(f"✅ No more pending messages for project {project_id}. Handler exiting loop.", debug_flag=debug)
                await logger_service.log_to_db(
                    project_id,
                    "Project has no more pending messages. Handler exiting gracefully.",
                    level="debug",
                    code="NO_PENDING_MESSAGES"
                )
                break

            log_console(f"📬 Found {len(pending_messages)} pending message(s) (Iteration {iteration}). Processing...", debug_flag=debug)
            await logger_service.log_to_db(
                project_id,
                f"Processing {len(pending_messages)} pending message(s) in iteration {iteration}.",
                level="debug",
                code="MESSAGES_FOUND"
            )

            for message in pending_messages:
                await handle_message(message, project_context)

        # Log warning if max iterations are reached.
        if iteration >= MAX_PROJECT_HANDLER_ITERATIONS:
            log_message = f"Max iterations ({MAX_PROJECT_HANDLER_ITERATIONS}) reached for project {project_id}. Exiting."
            log_console(f"⚠️ {log_message}", "warn")
            await logger_service.log_to_db(
                project_id,
                log_message,
                level="warn",
                code="MAX_ITERATIONS_REACHED"
            )

    except Exception as e:
        # Critical failure safeguard: Log to console and logger_service, then pause the project.
        log_message = f"Critical error in project handler for project {project_id}: {e}"
        log_console(f"❌ {log_message}", "error", debug_flag=True)
        await logger_service.log_to_db(
            project_id,
            log_message,
            level="error",
            code="HANDLER_CRASH"
        )
        await api_client.pause_project(project_id, "HANDLER_CRASH")

    # Final log entry upon completion or early exit.
    log_console(f"✅ Project handler finished for project {project_id}.", debug_flag=debug)
    await logger_service.log_to_db(
        project_id,
        f"Project handler finished execution for project {project_id}.",
        level="debug",
        code="PROJECT_HANDLER_END"
    )
