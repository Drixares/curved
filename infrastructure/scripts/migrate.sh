#!/bin/bash
set -euo pipefail

ENV=${1:-stg}
if [[ "$ENV" != "stg" && "$ENV" != "prd" ]]; then
  echo "ERROR: ENV must be 'stg' or 'prd', got '${ENV}'" >&2
  exit 1
fi

SECRETS_ID="curved/${ENV}"

echo "=== Running migrations (${ENV}) ==="

# Récupérer DATABASE_URL depuis AWS Secrets Manager
DB_URL=$(aws secretsmanager get-secret-value \
  --secret-id "${SECRETS_ID}" \
  --query 'SecretString' --output text | jq -r '.DATABASE_URL')

if [ -z "$DB_URL" ] || [ "$DB_URL" = "null" ]; then
  echo "ERROR: Failed to retrieve DATABASE_URL from Secrets Manager" >&2
  exit 1
fi

export DATABASE_URL="${DB_URL}"

cd packages/api
bun install --frozen-lockfile
bunx drizzle-kit migrate

echo "=== Done ==="
