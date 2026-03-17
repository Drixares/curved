#!/bin/bash
set -e

echo "Installing dependencies..."
HUSKY=0 bun install

echo "Running database migrations..."
cd packages/api && bunx drizzle-kit migrate && cd /app

echo "Starting dev servers..."

(cd /app/packages/api && bun run --watch src/index.ts) &
(cd /app/packages/web && bun run dev) &
(cd /app/packages/admin && bun run dev) &
(cd /app/packages/api && bunx drizzle-kit studio --host 0.0.0.0) &

# Keep container alive
wait
