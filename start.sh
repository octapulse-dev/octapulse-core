#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting OctaPulse: backend and frontend"

cleanup() {
  echo "Shutting down..."
  # Kill child processes if they exist
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

# -------------------- Backend --------------------
(
  cd "$ROOT_DIR/server"
  echo "[backend] Starting Python server..."
  python start_server.py
) &
BACKEND_PID=$!

# -------------------- Frontend --------------------
(
  cd "$ROOT_DIR/client"
  echo "[frontend] Ensuring dependencies..."
  if [[ ! -d node_modules ]]; then
    if command -v npm >/dev/null 2>&1; then
      npm install --no-progress --silent
    else
      echo "npm is not installed or not on PATH. Please install Node.js/npm." >&2
      exit 1
    fi
  fi
  echo "[frontend] Starting Next.js dev server..."
  npm run dev
) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press Ctrl+C to stop both."

# Wait for both processes
wait "$BACKEND_PID" "$FRONTEND_PID" || true


