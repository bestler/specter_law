#!/bin/bash

# Create a directory for certs if it doesn't exist
mkdir -p certs

# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"

# Set Python environment (optional, but good practice)
export UVICORN_CMD="uvicorn main:app --host localhost --port 8000 --ssl-keyfile=certs/key.pem --ssl-certfile=certs/cert.pem"

# Run FastAPI app with HTTPS
echo "Starting FastAPI app with HTTPS at https://localhost:8000 ..."
eval $UVICORN_CMD