# FILE: brain/handlers/message_handler.py
# Purpose: Core message processing orchestrator for the AI agent system.

from utils.console_log import log_console
from constants import MAX_RETRIES, BREACH_NOTICE, INVALID_AGENT_NOTICE, HISTORY_WINDOW_SIZE, MINIMUM_WINDOW_SIZE
from services import openai_service, prompt_builder, api_client
from services import logger_service
from handlers.error_handler import handle_error
from handlers.format_checker import parse_assistant_reply
from handlers.summarizer import summarize_agent_memory
from debug_flags import debug_message_handler as debug

async def handle_message(message: dict, context: dict) -> None:
    """
    Orchestrates the entire process of handling an incoming message for an AI agent.

    This function serves as the central pipeline for validating state, building prompts,
    interacting with the OpenAI API (with retries), validating responses, persisting
    messages, updating metadata, and triggering summarization. It handles errors
    gracefully, pausing the project on critical failures.

    Args:
        message (dict): The incoming message object to be processed.
        context (dict): The full project context, including agent details, API keys, etc.
    """
    try:
        # Initialize and extract primary identifiers.
        project_id: int = message["projectId"]
        original_sender_id: int = message["senderId"]
        current_responding_agent_id: int = message["receiverId"]
        message_id: int = message["id"]
        original_content: str = message["content"]
        retry_count: int = message.get("retry_count", 0)

        log_console(f"📥 Handling message {message_id} from {original_sender_id} to {current_responding_agent_id}", debug_flag=debug)
        log_console(f"↩️ Retry count for message {message_id}: {retry_count}", debug_flag=debug)

        # Pre-flight validation checks.
        api_key_for_openai: str | None = context.get("api_key")
        if not api_key_for_openai:
            log_console(f"❌ Missing API Token for project {project_id}. Pausing project.", "error")
            await logger_service.log_to_db(project_id, "Project paused: Missing or invalid OpenAI API key.", "error", "NO_API_TOKEN")
            await api_client.pause_project(project_id, "NO_API_TOKEN")
            return

        project_flags: dict = context.get("project_flags", {})
        if project_flags.get("paused"):
            log_console(f"⏸️ Project {project_id} is paused. Skipping message.", debug_flag=debug)
            return

        id_to_name_map: dict = context.get("id_to_name", {})
        name_to_id_map: dict = context.get("name_to_id", {})
        responding_agent_context: dict | None = context.get("agents", {}).get(current_responding_agent_id)
        if not responding_agent_context:
            log_console(f"❌ Responding agent {current_responding_agent_id} not in context. Pausing.", "error")
            await logger_service.log_to_db(project_id, f"Project paused: Agent {current_responding_agent_id} not found in project context.", "error", "AGENT_NOT_FOUND")
            await api_client.pause_project(project_id, "AGENT_NOT_FOUND")
            return

        # Context and prompt construction.
        message_count_for_summary: int = responding_agent_context.get("message_count", 0)
        history_fetch_count: int = min(HISTORY_WINDOW_SIZE, max(MINIMUM_WINDOW_SIZE, message_count_for_summary))
        recent_messages_db_rows: list = await api_client.get_agent_recent_messages(project_id, current_responding_agent_id, limit=history_fetch_count)

        summary: str | None = responding_agent_context.get("summary")
        project_overall_system_prompt: str = context.get("system_prompt", "")
        agent_specific_system_prompt: str = responding_agent_context.get("description", "")
        main_system_prompt_for_llm: str = prompt_builder.build_main_system_prompt(project_overall_system_prompt, agent_specific_system_prompt)
        original_sender_name: str = id_to_name_map.get(original_sender_id, "UnknownSender")
        current_responding_agent_name: str = id_to_name_map.get(current_responding_agent_id, "UnknownReceiver")
        formatted_trigger_message_content: str = f"[FROM: {original_sender_name} TO: {current_responding_agent_name}] {original_content.strip()}"

        base_llm_messages: list = prompt_builder.build_chat_prompt(
            main_system_prompt_for_llm, summary, recent_messages_db_rows,
            formatted_trigger_message_content, current_responding_agent_id, id_to_name_map
        )

        model: str = responding_agent_context.get("model")

        # Log prompt parts for debugging.
        log_console("📤 Sending message with the following prompt parts:", level="info", debug_flag=debug)
        log_console(f"• Summary:\n{summary or '[None]'}\n", level="info", debug_flag=debug)
        log_console("• History:", debug_flag=debug)
        for i, m in enumerate(recent_messages_db_rows, 1):
            sender = id_to_name_map.get(m["sender_id"], "Unknown")
            receiver = id_to_name_map.get(m.get("receiver_id"), "Unknown")
            log_console(f"  {i}. [{sender} → {receiver}]: {m['content']}", level="info", debug_flag=debug)
        log_console("• Trigger Message:\n" + formatted_trigger_message_content + "\n", level="info", debug_flag=debug)

        # LLM interaction and retry loop for syntax validation.
        parsed_llm_response: dict | None = None
        assistant_reply_content: str = ""
        try:
            for attempt in range(retry_count + 1, MAX_RETRIES + 1):
                assistant_reply_content = await openai_service.send_chat_completion(
                    base_llm_messages.copy(), model=model, api_key=api_key_for_openai, project_id=project_id
                )
                parsed_llm_response = parse_assistant_reply(assistant_reply_content)
                if parsed_llm_response:
                    break

                await api_client.increment_message_retry_count(message_id)
                log_console(f"❌ OpenAI response syntax validation failed on attempt {attempt}. Injecting correction notice.", "warn", debug_flag=debug)
                base_llm_messages.append({"role": "system", "content": BREACH_NOTICE.strip()})
        except Exception as e:
            error_code: str = str(e) if str(e) else "UNKNOWN_API_ERROR"
            log_message: str = f"Critical API/network error during LLM call for message {message_id}: {error_code}."
            await logger_service.log_to_db(project_id, log_message, "error", error_code)
            await api_client.pause_project(project_id, error_code)
            return

        if not parsed_llm_response:
            log_message = f"Message {message_id} failed all syntax validation attempts. Last LLM Output: {assistant_reply_content}"
            await logger_service.log_to_db(project_id, log_message, "error", "VALIDATION_FAILURE")
            await api_client.update_message_status(message_id, "failed")
            return

        actual_sender_name: str = parsed_llm_response["from"]
        actual_receiver_name: str = parsed_llm_response["to"]
        actual_sender_id: int | None = name_to_id_map.get(actual_sender_name)
        actual_receiver_id: int | None = name_to_id_map.get(actual_receiver_name)

        if not actual_sender_id or not actual_receiver_id:
            log_message = f"Project paused: AI responded with an invalid agent name ('{actual_sender_name}' or '{actual_receiver_name}')."
            await logger_service.log_to_db(project_id, log_message, "error", "INVALID_AGENT_NAME")
            await api_client.update_message_status(message_id, "failed")  # ✅ Add this line
            await api_client.pause_project(project_id, "INVALID_AGENT_NAME")
            return

        conv_key: tuple = tuple(sorted((actual_sender_id, actual_receiver_id)))
        conversation_id_for_new_msg: int | None = context.get("conversations", {}).get(conv_key)
        if not conversation_id_for_new_msg:
            log_message = f"Project paused: Missing conversation for agents {actual_sender_name} <-> {actual_receiver_name}."
            await logger_service.log_to_db(project_id, log_message, "error", "MISSING_CONVERSATION")
            await api_client.pause_project(project_id, "MISSING_CONVERSATION")
            return

        # Persist response and update state.
        await api_client.create_agent_message({
            "project_id": project_id,
            "conversation_id": conversation_id_for_new_msg,
            "sender_id": actual_sender_id,
            "receiver_id": actual_receiver_id,
            "content": parsed_llm_response["content"],
            "type": "assistant",
            "status": "pending"
        })

        await api_client.update_message_status(message_id, 'sent')
        await api_client.decrement_message_limit(project_id)
        await api_client.increment_agent_message_count(project_id, actual_sender_id)

        log_console(f"✅ Assistant reply sent from {actual_sender_id} to {actual_receiver_id}", debug_flag=debug)

        # Memory management: Update local memory and trigger summarization if active.
        if actual_sender_id in context["agents"]:
            context["agents"][actual_sender_id]["message_count"] += 1

            if context["agents"][actual_sender_id]["message_count"] >= HISTORY_WINDOW_SIZE:
                try:
                    await summarize_agent_memory(
                        project_id,
                        actual_sender_id,
                        api_key_for_openai,
                        id_to_name_map
                    )
                except Exception as e:
                    log_console(f"⚠️ Failed to summarize agent {actual_sender_id}: {e}", level="warn")
                    await logger_service.log_to_db(project_id, f"Failed to summarize agent {actual_sender_id}: {e}", "warn", "SUMMARY_FAILURE")

    except Exception as e:
        log_message: str = f"CRITICAL ERROR IN MESSAGE HANDLER for project {message.get('projectId')}: {e}"
        log_console(log_message, "error", True)
        try:
            project_id_for_crash = message.get("projectId")
            await logger_service.log_to_db(
                project_id_for_crash,
                log_message,
                "error",
                "HANDLER_CRASH"
            )
            await api_client.pause_project(project_id_for_crash, "HANDLER_CRASH")
        except Exception as inner_e:
            log_console(f"EXTREME CRITICAL: Failed to log crash or pause project {message.get('projectId')}: {inner_e}", "error", True)
