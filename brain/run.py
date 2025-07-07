# FILE: brain/run.py
# Purpose: Entry point for running the FastAPI application using Uvicorn.

import uvicorn
from main import app # Import the FastAPI application instance.

# This file primarily serves to start the Uvicorn server,
# deferring specific application startup logging to main.py.

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)