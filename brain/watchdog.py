# FILE: brain/watchdog_task.py
# Purpose: Monitors project activity and automatically pauses stalled or inactive projects.
# Designed to be run by an external scheduler (e.g., Cron, Cloud Scheduler).

import asyncio
from datetime import datetime, timedelta, timezone

from services import api_client
from services import logger_service
from utils.console_log import log_console

# --- Configuration ---
# These can be set back to their original values or kept short for frequent checks.
STALE_PENDING_TIMEOUT_MINUTES = 1.5 
INACTIVITY_TIMEOUT_MINUTES = 1.5
LOCAL_LOOP_INTERVAL_SECONDS = 10 

async def check_for_stalled_projects():
    """
    Core watchdog logic: Identifies and pauses projects that are stalled
    (stuck pending messages) or inactive (no recent activity).
    """
    log_console("🐶 Watchdog Task: Checking for stalled projects...")
    await logger_service.log_to_db(
        None,
        "Watchdog Task initiated: Checking for stalled projects.",
        level="info",
        code="WATCHDOG_START"
    )
    
    try:
        active_projects = await api_client.get_active_projects()
        
        if not active_projects:
            log_console("🐶 Watchdog Task: No active projects found.")
            return

        now_utc = datetime.now(timezone.utc)

        for project in active_projects:
            project_id = project['id']
            log_console(f"--- Checking Project ID: {project_id} ---")
            
            # Check for stale pending messages.
            oldest_pending_data = await api_client.get_oldest_pending_message_timestamp(project_id)
            oldest_pending_ts_str = oldest_pending_data.get('timestamp') if oldest_pending_data else None

            if oldest_pending_ts_str:
                oldest_pending_ts = datetime.fromisoformat(oldest_pending_ts_str.replace('Z', '+00:00'))
                
                message_age_seconds = (now_utc - oldest_pending_ts).total_seconds()
                log_console(f"  [Stale Check] Oldest pending message is {int(message_age_seconds)} seconds old.")
                
                if message_age_seconds > STALE_PENDING_TIMEOUT_MINUTES * 60:
                    log_console(f"  [Stale Check] ACTION: Pausing project {project_id}. Reason: Pending message is older than {STALE_PENDING_TIMEOUT_MINUTES} min.", "warn")
                    await logger_service.log_to_db(
                        project_id,
                        f"Project stalled due to stuck pending message (>{STALE_PENDING_TIMEOUT_MINUTES}min). Pausing.",
                        level="warn",
                        code="STUCK_QUEUE_TIMEOUT"
                    )
                    await api_client.pause_project(project_id, "STUCK_QUEUE_TIMEOUT")
                    continue
            else:
                log_console("  [Stale Check] Project has no pending messages.")

            # If no stuck messages, check for general inactivity.
            last_activity_ts_str = project['last_activity_at']
            if last_activity_ts_str:
                last_activity_ts = datetime.fromisoformat(last_activity_ts_str.replace('Z', '+00:00'))
                
                activity_age_seconds = (now_utc - last_activity_ts).total_seconds()
                log_console(f"  [Idle Check] Project has been idle for {int(activity_age_seconds)} seconds.")
                
                if activity_age_seconds > INACTIVITY_TIMEOUT_MINUTES * 60:
                    log_console(f"  [Idle Check] ACTION: Pausing project {project_id}. Reason: Idle for more than {INACTIVITY_TIMEOUT_MINUTES} min.", "warn")
                    await logger_service.log_to_db(
                        project_id,
                        f"Project idle for over {INACTIVITY_TIMEOUT_MINUTES} minutes. Pausing.",
                        level="warn",
                        code="IDLE_TIMEOUT"
                    )
                    await api_client.pause_project(project_id, "IDLE_TIMEOUT")

    except Exception as e:
        log_console(f"❌ Watchdog Task error: {e}", level="error")
        await logger_service.log_to_db(
            None,
            f"Watchdog Task encountered a critical error: {e}",
            level="error",
            code="WATCHDOG_CRASH"
        )

async def run_local_watchdog_loop():
    """
    Runs the watchdog in a continuous loop for local development and testing.
    """
    log_console("🐶 Watchdog service started in local polling mode.")
    while True:
        await check_for_stalled_projects()
        log_console(f"--- Watchdog sleeping for {LOCAL_LOOP_INTERVAL_SECONDS} seconds... ---\n")
        await asyncio.sleep(LOCAL_LOOP_INTERVAL_SECONDS)

# Script entry point.
if __name__ == "__main__":
    asyncio.run(run_local_watchdog_loop())