#!/bin/bash
set -euo pipefail

ENV=${1:-stg}
if [[ "$ENV" != "stg" && "$ENV" != "prd" ]]; then
  echo "ERROR: ENV must be 'stg' or 'prd', got '${ENV}'" >&2
  exit 1
fi

FUNCTION_NAME="curved-api-${ENV}"

echo "=== Building API for Lambda (${ENV}) ==="
cd packages/api
bun install --frozen-lockfile
bun run build:lambda
bun run package:lambda

echo "=== Deploying to Lambda ==="
aws lambda update-function-code \
  --function-name "${FUNCTION_NAME}" \
  --zip-file fileb://lambda.zip

aws lambda wait function-updated --function-name "${FUNCTION_NAME}"
echo "=== Done ==="
