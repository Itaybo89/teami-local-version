# FILE: brain/services/prompt_builder.py
# Purpose: Manages the construction of structured prompts for the AI agent LLM.

from constants import FFORMAT_RULES, SYSTEM_ROLE_TAG

def _format_historical_message_content(db_message_row: dict, id_to_name_map: dict) -> str:
    """
    Formats the content string for a single historical message,
    including [FROM: SenderName TO: ReceiverName] prefixes.
    """
    sender_name = id_to_name_map.get(db_message_row["sender_id"], "UnknownSender")
    receiver_name = id_to_name_map.get(db_message_row.get("receiver_id"), "UnknownReceiver")
    
    # Handle special case for System Agent (ID 0) if its name isn't in the map.
    if db_message_row["sender_id"] == 0 and sender_name == "UnknownSender":
        sender_name = "System"

    return f"[FROM: {sender_name} TO: {receiver_name}] {db_message_row['content'].strip()}"

def build_main_system_prompt(project_system_prompt: str, agent_system_prompt: str) -> str:
    """
    Builds the main system prompt for the LLM, combining project-specific
    and agent-specific instructions, along with general formatting rules.
    """
    return f"{project_system_prompt.strip()}\n\n{FFORMAT_RULES.strip()}\n\n{SYSTEM_ROLE_TAG}\n{agent_system_prompt.strip()}"

def build_summary_context_prompt(summary_text: str) -> str:
    """
    Creates a system message content string for the conversation summary.
    """
    return f"Here’s a summary of the conversation so far:\n{summary_text.strip()}"

def build_chat_prompt(
    main_system_prompt_content: str,
    summary_text: str = None,
    historical_messages_db_rows: list = [],
    current_user_message_formatted_content: str = "",
    current_agent_id_for_perspective: int = None,
    id_to_name_map: dict = {}
) -> list:
    """
    Builds the full chat prompt (list of message dictionaries) for the OpenAI API.
    It includes the main system prompt, an optional summary, formatted historical messages,
    and the current formatted user message.

    Args:
        main_system_prompt_content (str): The primary system instructions.
        summary_text (str, optional): The conversation summary.
        historical_messages_db_rows (list, optional): List of message rows from the DB.
            Expected to be in chronological order (oldest to newest).
        current_user_message_formatted_content (str, optional): The most recent message
            that the current agent needs to respond to, already formatted with [FROM: TO:].
        current_agent_id_for_perspective (int, optional): The ID of the agent whose
            perspective is being used to determine "user" vs "assistant" roles for history.
        id_to_name_map (dict, optional): A dictionary mapping agent IDs to agent names.
    """
    messages = []

    # Add main system prompt.
    if main_system_prompt_content:
        messages.append({
            "role": "system",
            "content": main_system_prompt_content
        })

    # Add conversation summary as a system message.
    if summary_text:
        messages.append({
            "role": "system",
            "content": build_summary_context_prompt(summary_text)
        })

    # Add historical messages from the database.
    if historical_messages_db_rows and current_agent_id_for_perspective is not None:
        for msg_row in historical_messages_db_rows:
            # Determine role based on the current agent's perspective.
            role_for_llm = "user" # Default for messages received by the current agent.
            if msg_row["sender_id"] == current_agent_id_for_perspective:
                role_for_llm = "assistant" # Messages sent by the current agent in the past.
            
            messages.append({
                "role": role_for_llm,
                "content": _format_historical_message_content(msg_row, id_to_name_map)
            })

    # Add the current user message that the agent needs to respond to.
    if current_user_message_formatted_content:
        messages.append({
            "role": "user",
            "content": current_user_message_formatted_content.strip()
        })

    return messages

# The example_usage_in_message_handler function has been removed as per the plan
# to eliminate illustrative or non-functional code from the final file.