#!/bin/bash
set -euo pipefail

ENV=${1:-stg}
if [[ "$ENV" != "stg" && "$ENV" != "prd" ]]; then
  echo "ERROR: ENV must be 'stg' or 'prd', got '${ENV}'" >&2
  exit 1
fi

BUCKET="curved-web-${ENV}"

# Déterminer l'URL API
if [ "$ENV" = "prd" ]; then
  API_URL="https://api.curved.app"
  CF_ID="${CF_DISTRIBUTION_WEB_PRD:-}"
else
  API_URL="https://api-stg.curved.app"
  CF_ID="${CF_DISTRIBUTION_WEB_STG:-}"
fi

echo "=== Building web (${ENV}) ==="
cd packages/web
VITE_API_URL="${API_URL}" bun run build

echo "=== Syncing to S3 ==="
aws s3 sync dist/ "s3://${BUCKET}" --delete

if [ -n "$CF_ID" ]; then
  echo "=== Invalidating CloudFront ==="
  aws cloudfront create-invalidation --distribution-id "${CF_ID}" --paths "/*"
fi

echo "=== Done ==="
