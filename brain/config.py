# FILE: brain/config.py
# Purpose: Loads and validates environment-specific configurations for the AI Brain service.

import os
from dotenv import load_dotenv

# Load environment variables from the shared root .env file.
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path=env_path)

# Define essential environment variables required for the brain service.
REQUIRED_KEYS = [
    'BACKEND_API_URL',  # URL for the backend's internal API.
    'BRAIN_API_KEY',    # Shared secret for authenticating with the backend.
    'ENCRYPT_SECRET',   # Secret for decrypting sensitive keys like the OpenAI key.
]

# Check for any missing required environment variables and raise an error if found.
missing = [key for key in REQUIRED_KEYS if not os.getenv(key)]
if missing:
    raise EnvironmentError(f"Missing required environment variables: {', '.join(missing)}")

# --- Configuration Values ---
BACKEND_API_URL: str = os.getenv("BACKEND_API_URL")
BRAIN_API_KEY: str = os.getenv("BRAIN_API_KEY")
ENCRYPT_SECRET: str = os.getenv("ENCRYPT_SECRET")