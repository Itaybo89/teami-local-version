# FILE: brain/runner.py
# Purpose: Acts as the primary task processor for a single project, initiated on-demand.
# This module orchestrates the core work for a project, delegating to handlers.

from debug_flags import debug_runner # Controls verbose logging for this module.
from handlers.project_handler import handle_project # Core handler for processing a project's tasks.
from utils.console_log import log_console # Centralized console logging utility.
from services import logger_service # Import logger_service for persistent error logging.

async def process_project_tasks(project_id: int):
    """
    Main entry point for processing all pending tasks associated with a specific project ID.

    This function orchestrates the workflow for a single project, logging the start and end
    of processing and handling top-level errors to prevent silent crashes.

    Args:
        project_id (int): The unique identifier for the project to be processed.
    """
    try:
        log_console(f"🏃‍♂️ Runner starting work for project {project_id}...", debug_flag=debug_runner)
        await handle_project(project_id)
        log_console(f"✅ Runner finished work for project {project_id}.", debug_flag=debug_runner)
    except Exception as e:
        # Catch any catastrophic, unhandled exceptions to prevent silent crashes.
        # This critical error is always logged to the console for immediate visibility.
        log_console(f"❌ Critical error in runner for project {project_id}: {e}", level="error", debug_flag=True)
        
        # Log this critical error to the database for persistence and later analysis.
        await logger_service.log_to_db(
            project_id,
            f"Critical error in runner: {e}",
            level="error",
            code="RUNNER_CRASH"
        )