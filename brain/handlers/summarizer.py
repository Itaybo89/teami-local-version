# FILE: brain/handlers/summarizer.py
# Purpose: Handles the summarization of recent agent memory using the OpenAI service.

from debug_flags import debug_summarizer as debug
from services import api_client # Still needed for get_agent_recent_messages and save_summary
from services import openai_service
from services import logger_service # Import logger_service for persistent logging
from utils.console_log import log_console

async def summarize_agent_memory(project_id: int, agent_id_to_summarize_for: int, api_key: str, id_to_name_map: dict) -> None:
    """
    Summarizes recent messages for a specific agent using the OpenAI service.

    Args:
        project_id (int): The ID of the project.
        agent_id_to_summarize_for (int): The ID of the agent whose memory is being summarized.
        api_key (str): The OpenAI API key.
        id_to_name_map (dict): A map of {agent_id: agent_name}.
    """
    try:
        log_console(
            f"🧠 Triggering summarization for agent {agent_id_to_summarize_for} "
            f"(Name: {id_to_name_map.get(agent_id_to_summarize_for, 'Unknown')}) in project {project_id}",
            debug_flag=debug
        )
        await logger_service.log_to_db( # Log initiation of summarization for persistent record
            project_id,
            f"Initiating summarization for agent {agent_id_to_summarize_for}.",
            level="debug",
            code="SUMMARIZATION_INITIATED"
        )

        # 1. Fetch recent messages for the agent.
        recent_message_db_rows = await api_client.get_agent_recent_messages(
            project_id, agent_id_to_summarize_for, limit=20
        )

        if not recent_message_db_rows:
            log_console(
                f"⚠️ No recent messages to summarize for agent {agent_id_to_summarize_for}.",
                debug_flag=debug
            )
            await logger_service.log_to_db( # Log if no messages found for persistent record
                project_id,
                f"No recent messages found for summarization for agent {agent_id_to_summarize_for}.",
                level="debug",
                code="NO_MESSAGES_TO_SUMMARIZE"
            )
            return

        # 2. Format messages for summarization by OpenAI.
        conversation_text_for_summary = []
        for msg_row in recent_message_db_rows:
            sender_name = id_to_name_map.get(msg_row["sender_id"], "UnknownSender")
            receiver_name = id_to_name_map.get(msg_row.get("receiver_id"), "UnknownReceiver")
            conversation_text_for_summary.append(
                f"[{sender_name} to {receiver_name}]: {msg_row['content'].strip()}"
            )

        full_conversation_str = "\n\n".join(conversation_text_for_summary)
        messages_for_openai_summarizer = [
            {
                "role": "user",
                "content": f"Please summarize the following conversation extract:\n\n{full_conversation_str}"
            }
        ]

        log_console(
            f"📝 Preview of content being sent for summarization:\n{full_conversation_str[:500]}...",
            debug_flag=debug
        )

        # 3. Generate summary using OpenAI service.
        generated_summary = await openai_service.summarize_messages(
            messages_to_summarize=messages_for_openai_summarizer,
            api_key=api_key,
            project_id=project_id # Pass project_id for openai_service's own logging
        )

        if not generated_summary:
            log_console(
                f"⚠️ Summarization for agent {agent_id_to_summarize_for} returned an empty result.",
                level="warn",
                debug_flag=debug
            )
            await logger_service.log_to_db( # Log empty summary for persistent record
                project_id,
                f"Summarization for agent {agent_id_to_summarize_for} returned an empty result.",
                level="warn",
                code="EMPTY_SUMMARY_RESULT"
            )
            return

        # 4. Validate IDs and Save the generated summary.
        if not all([project_id, agent_id_to_summarize_for, generated_summary]):
            log_console(
                f"❌ Refusing to save summary — missing ID or content. "
                f"project={project_id}, agent={agent_id_to_summarize_for}",
                level="error", debug_flag=True
            )
            await logger_service.log_to_db( # Log refusal to save for persistent record
                project_id,
                f"Refusing to save summary for agent {agent_id_to_summarize_for} due to missing ID or content.",
                level="error",
                code="SUMMARY_SAVE_FAILED_VALIDATION"
            )
            return

        await api_client.save_summary({
            "projectId": project_id,
            "agentId": agent_id_to_summarize_for,
            "summary": generated_summary,
            "historyJson": None # Assuming historyJson is intentionally None here.
        })

        log_console(
            f"✅ Summary saved for agent {agent_id_to_summarize_for}: '{generated_summary[:100]}...'",
            debug_flag=debug
        )
        await logger_service.log_to_db( # Log successful save for persistent record
            project_id,
            f"Summary successfully saved for agent {agent_id_to_summarize_for}.",
            level="debug", # Can be info/debug depending on desired verbosity for system events
            code="SUMMARY_SAVED"
        )

    except Exception as e:
        log_console(
            f"❌ Summarization failed for agent {agent_id_to_summarize_for} in project {project_id}: {e}",
            level="error",
            debug_flag=True
        )
        await logger_service.log_to_db( # Log unexpected summarization failure for persistent record
            project_id,
            f"Summarization failed for agent {agent_id_to_summarize_for}: {e}",
            level="error",
            code="SUMMARIZATION_UNEXPECTED_ERROR"
        )