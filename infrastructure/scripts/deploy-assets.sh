#!/bin/bash
set -euo pipefail

ENV=${1:-stg}
if [[ "$ENV" != "stg" && "$ENV" != "prd" ]]; then
  echo "ERROR: ENV must be 'stg' or 'prd', got '${ENV}'" >&2
  exit 1
fi

BUCKET="curved-www-assets-${ENV}"

echo "=== Syncing assets to S3 (${ENV}) ==="
aws s3 sync assets/ "s3://${BUCKET}" --delete

echo "=== Done ==="
