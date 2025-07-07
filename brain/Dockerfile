# FILE: brain/Dockerfile
# Purpose: Builds the Docker image for the AI Brain service.

# Use a lean Python base image.
FROM python:3.11-slim

# Set the working directory inside the container.
WORKDIR /app

# Install Python dependencies.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application source code into the container.
COPY . .

# Define the default command to run the application when the container starts.
CMD ["python", "run.py"]