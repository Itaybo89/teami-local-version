# FILE: brain/main.py
# Purpose: Defines the main FastAPI web server entry point for the AI Brain service.
# It acts as the primary API interface, receiving "nudges" to process project tasks.

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

from utils.console_log import log_console
from runner import process_project_tasks

# Toggle between foreground (debug/development) and background (production) task execution.
USE_FOREGROUND_MODE = True  # Set to False for production deployments.

# Initialize the FastAPI application.
app = FastAPI(
    title="AI Worker Brain",
    description="Receives nudges to process tasks for AI agent projects.",
    version="1.0.0"
)

# Pydantic model for the incoming 'nudge' request.
class NudgePayload(BaseModel):
    project_id: int

@app.get("/", summary="Health Check")
async def root():
    """
    A simple root endpoint (health check) to confirm that the FastAPI server
    is alive and running, indicating the service is operational.
    """
    return {"message": "AI Brain is running"}

@app.post("/nudge-brain", summary="Trigger a Project Task")
async def nudge_brain_endpoint(payload: NudgePayload, background_tasks: BackgroundTasks):
    """
    Receives a "nudge" (an HTTP POST request) to initiate task processing for a specific project.
    Execution mode (foreground vs. background) is determined by `USE_FOREGROUND_MODE`.

    Args:
        payload (NudgePayload): The request body containing the project_id.
        background_tasks (BackgroundTasks): FastAPI's dependency for managing tasks after HTTP response.

    Returns:
        dict: Status message indicating whether the task was completed in foreground or queued.

    Raises:
        HTTPException: If an unhandled error occurs during foreground task execution.
    """
    project_id = payload.project_id

    if USE_FOREGROUND_MODE:
        # Run task in foreground for debugging. API response waits for completion.
        log_console(f"🧠 Brain received nudge for project {project_id}. Running task in FOREGROUND (debug mode).", "warn")
        try:
            await process_project_tasks(project_id)
            log_console(f"✅ Foreground task for project {project_id} completed successfully.", "info")
            return {
                "status": "completed_in_foreground",
                "message": f"Brain task for project {project_id} finished."
            }
        except Exception as e:
            log_console(f"❌ ERROR during foreground task execution: {e}", "error", True)
            raise HTTPException(status_code=500, detail=f"Error processing project {project_id}: {e}")
    else:
        # Queue task in background for production. API returns immediate response.
        log_console(f"🧠 Brain received nudge for project {project_id}. Queuing task in BACKGROUND.", "info")
        background_tasks.add_task(process_project_tasks, project_id)
        return {
            "status": "queued_in_background",
            "message": f"Task for project {project_id} started in background."
        }

if __name__ == "__main__":
    # Server entry point: Starts the Uvicorn ASGI server.
    log_console("🚀 Starting brain in SERVER mode (listening for HTTP nudges)...")
    uvicorn.run(app, host="0.0.0.0", port=8000)