# FILE: brain/services/openai_service.py
# Purpose: Provides a dedicated service for all interactions with the OpenAI API,
#          handling both structured chat completions and message summarization.

import openai
import json
import datetime
from debug_flags import debug_openai_service as debug #
from utils.console_log import log_console #
from services import logger_service # New: Import the dedicated logger service

# The local file logging feature is for deep debugging only and is kept commented out.
# LOG_FILE = "openai_prompt_log.txt"
#
# def log_to_file(title, content):
#     """Logs the given content to a specified log file with a title."""
#     try:
#         utc_now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
#         with open(LOG_FILE, "a", encoding="utf-8") as f:
#             f.write(f"\n\n=== {title} ({json.dumps({'timestamp': utc_now_str})}) ===\n")
#             if isinstance(content, str):
#                 f.write(content)
#             else:
#                 f.write(json.dumps(content, indent=2, ensure_ascii=False))
#             f.write("\n" + "=" * 50 + "\n")
#     except Exception as e:
#         log_console(f"Failed to log to file: {LOG_FILE}. Error: {e}", level="error", debug_flag=True)
#         log_console(f"Original content for {title}: {content}", level="debug", debug_flag=True)


async def send_chat_completion(messages: list, model: str = "gpt-4o", api_key: str = None, use_schema: bool = True, project_id: int = None) -> str:
    """
    Sends a list of message objects to the OpenAI Chat Completions API.

    This function enforces a JSON schema for agent-to-agent communication,
    and translates specific OpenAI API errors into generic exceptions.

    Args:
        messages (list): A list of message objects for the chat conversation.
        model (str, optional): The OpenAI model to use. Defaults to "gpt-4o".
        api_key (str, optional): The OpenAI API key.
        use_schema (bool, optional): If True, forces the model to reply in a
                                     specific JSON format. Defaults to True.
        project_id (int, optional): The ID of the project, used for persistent logging.

    Returns:
        str: The raw string content of the assistant's message.

    Raises:
        Exception: For specific API errors (e.g., "INVALID_API_KEY", "OPENAI_BAD_REQUEST").
    """
    try:
        client = openai.AsyncOpenAI(api_key=api_key)

        log_console(f"✉️ Sending {len(messages)} messages to OpenAI model {model}. Schema: {use_schema}", debug_flag=debug)

        kwargs = {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
        }

        if use_schema:
            kwargs["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "agent_reply",
                    "description": "Structured reply from the agent, adhering to the specified JSON format.",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "from": {"type": "string", "description": "The name of the agent sending the message."},
                            "to": {"type": "string", "description": "The name of the agent intended to receive the message."},
                            "body": {"type": "string", "description": "The main content of the message."}
                        },
                        "required": ["from", "to", "body"],
                        "additionalProperties": False
                    }
                }
            }

        response = await client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content

        log_console("🗣️ Assistant raw response received.", debug_flag=debug)
        if len(content) < 300:
             log_console(f"Content: {content}", debug_flag=debug)

        return content

    except openai.BadRequestError as e:
        log_console(f"❌ OpenAI BadRequestError: {e}", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, f"OpenAI Bad Request Error: {e}", level="error", code="OPENAI_BAD_REQUEST")
        raise Exception("OPENAI_BAD_REQUEST")

    except openai.AuthenticationError as e:
        log_console("❌ Invalid OpenAI API key.", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, "OpenAI Authentication Error: Invalid API Key.", level="error", code="INVALID_API_KEY")
        raise Exception("INVALID_API_KEY")

    except openai.RateLimitError as e:
        log_console("⚠️ OpenAI rate limit hit.", level="warn", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, "OpenAI Rate Limit Error: Token exhausted or rate limit hit.", level="warn", code="TOKEN_EXHAUSTED")
        raise Exception("TOKEN_EXHAUSTED")

    except openai.OpenAIError as e:
        log_console(f"❌ OpenAI API error: {e}", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, f"General OpenAI API Error: {e}", level="error", code="OPENAI_ERROR")
        raise Exception("OPENAI_ERROR")
    
    except Exception as e:
        log_console(f"❌ Unexpected error in send_chat_completion: {e}", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, f"Unexpected error in OpenAI service (chat completion): {e}", level="error", code="UNEXPECTED_OPENAI_SERVICE_ERROR")
        raise Exception("UNEXPECTED_OPENAI_SERVICE_ERROR")


async def summarize_messages(messages_to_summarize: list, model: str = "gpt-4o", api_key: str = None, project_id: int = None) -> str:
    """
    Sends a list of messages to OpenAI for summarization.

    Args:
        messages_to_summarize (list): A list of message objects to be summarized.
        model (str, optional): The OpenAI model to use. Defaults to "gpt-4o".
        api_key (str, optional): The OpenAI API key.
        project_id (int, optional): The ID of the project, used for persistent logging.

    Returns:
        str: The summarized text content.

    Raises:
        Exception: For OpenAI API errors or other unexpected issues.
    """
    log_console(f"📚 Summarizing {len(messages_to_summarize)} messages using model {model}", level="debug", debug_flag=debug)

    client = openai.AsyncOpenAI(api_key=api_key)

    chat_messages_for_summary = [{
        "role": "system",
        "content": "You are an AI summarizer. Summarize the following conversation/messages as a task-focused memory. Retain key facts, decisions, and outcomes. Do not add interpretations or analysis. Be concise, clear, and specific."
    }] + messages_to_summarize

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=chat_messages_for_summary,
            temperature=0.3,
            max_tokens=512,
        )

        summary_content = response.choices[0].message.content.strip()

        log_console("🧠 Summary result received.", debug_flag=debug)
        if len(summary_content) < 300:
             log_console(f"Summary: {summary_content}", debug_flag=debug)

        return summary_content

    except openai.OpenAIError as e:
        log_console(f"❌ OpenAI error during summarization: {e}", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, f"OpenAI error during summarization: {e}", level="error", code="OPENAI_SUMMARY_ERROR")
        raise Exception(f"OPENAI_SUMMARY_ERROR: {e}")
    except Exception as e:
        log_console(f"❌ Unexpected error during summarization: {e}", level="error", debug_flag=True)
        if project_id:
            await logger_service.log_to_db(project_id, f"Unexpected error during summarization: {e}", level="error", code="UNEXPECTED_SUMMARY_ERROR")
        raise Exception(f"UNEXPECTED_SUMMARY_ERROR: {e}")