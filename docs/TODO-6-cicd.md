# TODO Phase 6 — CI/CD (GitHub Actions)

> Pipeline CI/CD sur **GitHub Actions** pour déployer les packages sur AWS.
> Tous les scripts doivent pouvoir être lancés en local.

---

## Table des matières

1. [Stratégie de branches](#1-stratégie-de-branches)
2. [Secrets & Variables GitHub](#2-secrets--variables-github)
3. [Scripts de déploiement (local + CI)](#3-scripts-de-déploiement-local--ci)
4. [Pipeline CI — Lint & Build](#4-pipeline-ci--lint--build)
5. [Pipeline Deploy STG](#5-pipeline-deploy-stg)
6. [Pipeline Deploy PRD](#6-pipeline-deploy-prd)
7. [Pipeline Migrations DB](#7-pipeline-migrations-db)
8. [Workflow complet](#8-workflow-complet)
9. [Ordre d'implémentation](#9-ordre-dimplémentation)

---

## 1. Stratégie de branches

| Branche                                    | Déclencheur  | Actions                                |
| ------------------------------------------ | ------------ | -------------------------------------- |
| Feature branches (`feat/*`, `fix/*`, etc.) | Push         | CI uniquement (lint + build)           |
| `develop` ou `staging`                     | Push / Merge | CI + Deploy STG automatique            |
| `main`                                     | Push / Merge | CI + Deploy PRD (avec approval manuel) |

---

## 2. Secrets & Variables GitHub

### 2.1 Configurer dans Settings → Secrets and variables → Actions

#### Secrets (valeurs sensibles)

| Secret                  | Description                |
| ----------------------- | -------------------------- |
| `AWS_ACCESS_KEY_ID`     | Access key IAM déploiement |
| `AWS_SECRET_ACCESS_KEY` | Secret key                 |

#### Variables (valeurs non-sensibles)

| Variable                    | Description          | Valeur STG                   | Valeur PRD               |
| --------------------------- | -------------------- | ---------------------------- | ------------------------ |
| `AWS_REGION`                | Région AWS           | `eu-west-3`                  | `eu-west-3`              |
| `S3_BUCKET_WEB_STG`         | Bucket S3 web        | `curved-web-stg`             | —                        |
| `S3_BUCKET_WEB_PRD`         | Bucket S3 web        | —                            | `curved-web-prd`         |
| `S3_BUCKET_ADMIN_STG`       | Bucket S3 admin      | `curved-admin-stg`           | —                        |
| `S3_BUCKET_ADMIN_PRD`       | Bucket S3 admin      | —                            | `curved-admin-prd`       |
| `S3_BUCKET_ASSETS_STG`      | Bucket S3 www-assets | `curved-www-assets-stg`      | —                        |
| `S3_BUCKET_ASSETS_PRD`      | Bucket S3 www-assets | —                            | `curved-www-assets-prd`  |
| `LAMBDA_FUNCTION_API_STG`   | Nom Lambda API       | `curved-api-stg`             | —                        |
| `LAMBDA_FUNCTION_API_PRD`   | Nom Lambda API       | —                            | `curved-api-prd`         |
| `LAMBDA_FUNCTION_CRON_STG`  | Nom Lambda Cron      | `curved-cron-backup-stg`     | —                        |
| `LAMBDA_FUNCTION_CRON_PRD`  | Nom Lambda Cron      | —                            | `curved-cron-backup-prd` |
| `CF_DISTRIBUTION_WEB_STG`   | CloudFront ID web    | `E1XXXXXXXXXX`               | —                        |
| `CF_DISTRIBUTION_WEB_PRD`   | CloudFront ID web    | —                            | `E2XXXXXXXXXX`           |
| `CF_DISTRIBUTION_ADMIN_STG` | CloudFront ID admin  | `E3XXXXXXXXXX`               | —                        |
| `CF_DISTRIBUTION_ADMIN_PRD` | CloudFront ID admin  | —                            | `E4XXXXXXXXXX`           |
| `VITE_API_URL_STG`          | URL API staging      | `https://api-stg.curved.app` | —                        |
| `VITE_API_URL_PRD`          | URL API prod         | —                            | `https://api.curved.app` |
| `SECRETS_MANAGER_STG`       | Nom secret SM        | `curved/stg`                 | —                        |
| `SECRETS_MANAGER_PRD`       | Nom secret SM        | —                            | `curved/prd`             |

### 2.2 Créer les environments GitHub

- [ ] Settings → Environments → créer `staging`
- [ ] Settings → Environments → créer `production`
  - Ajouter **required reviewers** (toi-même ou ton équipe)
  - Ajouter **branch protection** : only `main`

---

## 3. Scripts de déploiement (local + CI)

> Tous les scripts sont dans `infrastructure/scripts/` et acceptent un argument `<env>` (stg/prd).
> Ils fonctionnent en local et en CI/CD.

### 3.1 Structure

```
infrastructure/
└── scripts/
    ├── deploy-api.sh
    ├── deploy-web.sh
    ├── deploy-admin.sh
    ├── deploy-assets.sh
    ├── deploy-crons.sh
    └── migrate.sh
```

### 3.2 `deploy-api.sh`

- [ ] Créer le script :

  ```bash
  #!/bin/bash
  set -e
  ENV=${1:-stg}
  FUNCTION_NAME="curved-api-${ENV}"

  echo "=== Building API for Lambda (${ENV}) ==="
  cd packages/api
  bun install
  bun run build:lambda
  bun run package:lambda

  echo "=== Deploying to Lambda ==="
  aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file fileb://lambda.zip

  aws lambda wait function-updated --function-name "${FUNCTION_NAME}"
  echo "=== Done ==="
  ```

### 3.3 `deploy-web.sh`

- [ ] Créer le script :

  ```bash
  #!/bin/bash
  set -e
  ENV=${1:-stg}
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
  ```

### 3.4 `deploy-admin.sh`

- [ ] Même structure que `deploy-web.sh` avec `curved-admin-${ENV}`

### 3.5 `deploy-assets.sh`

- [ ] Sync des assets statiques (images, logos) vers S3

  ```bash
  #!/bin/bash
  set -e
  ENV=${1:-stg}
  BUCKET="curved-www-assets-${ENV}"

  echo "=== Syncing assets to S3 (${ENV}) ==="
  aws s3 sync assets/ "s3://${BUCKET}" --delete

  echo "=== Done ==="
  ```

### 3.6 `deploy-crons.sh`

- [ ] Build + deploy de la Lambda cron

  ```bash
  #!/bin/bash
  set -e
  ENV=${1:-stg}
  FUNCTION_NAME="curved-cron-backup-${ENV}"

  echo "=== Building cron for Lambda (${ENV}) ==="
  cd packages/crons
  bun install
  bun run build:lambda
  bun run package:lambda

  echo "=== Deploying to Lambda ==="
  aws lambda update-function-code \
    --function-name "${FUNCTION_NAME}" \
    --zip-file fileb://lambda.zip

  aws lambda wait function-updated --function-name "${FUNCTION_NAME}"
  echo "=== Done ==="
  ```

### 3.7 `migrate.sh`

- [ ] Voir TODO-1 pour le détail du script

---

## 4. Pipeline CI — Lint & Build

Fichier : `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Prettier check
        run: bun run checks

      - name: Type check API
        run: cd packages/api && bunx tsc --noEmit

      - name: Type check Web
        run: cd packages/web && bunx tsc -b

      - name: Type check Admin
        run: cd packages/admin && bunx tsc -b

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build UI library
        run: cd packages/ui && bun run build

      - name: Build Web
        run: cd packages/web && bun run build
        env:
          VITE_API_URL: https://api-stg.curved.app

      - name: Build Admin
        run: cd packages/admin && bun run build

      - name: Build API for Lambda
        run: cd packages/api && bun run build:lambda

      - name: Build Crons for Lambda
        run: cd packages/crons && bun run build:lambda

      - uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: packages/web/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: admin-dist
          path: packages/admin/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: api-dist
          path: packages/api/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: crons-dist
          path: packages/crons/dist/
          retention-days: 1
```

---

## 5. Pipeline Deploy STG

Fichier : `.github/workflows/deploy-stg.yml`

```yaml
name: Deploy Staging

on:
  push:
    branches: [develop, staging]

concurrency:
  group: deploy-stg
  cancel-in-progress: false

jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  deploy-api:
    name: Deploy API to Lambda (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: api-dist
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Package Lambda
        run: cd dist && zip -r ../lambda.zip .

      - name: Deploy to Lambda
        run: |
          aws lambda update-function-code \
            --function-name ${{ vars.LAMBDA_FUNCTION_API_STG }} \
            --zip-file fileb://lambda.zip

      - name: Wait for update
        run: |
          aws lambda wait function-updated \
            --function-name ${{ vars.LAMBDA_FUNCTION_API_STG }}

  deploy-web:
    name: Deploy Web to S3 (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: web-dist
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET_WEB_STG }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CF_DISTRIBUTION_WEB_STG }} \
            --paths "/*"

  deploy-admin:
    name: Deploy Admin to S3 (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: admin-dist
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET_ADMIN_STG }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CF_DISTRIBUTION_ADMIN_STG }} \
            --paths "/*"

  deploy-crons:
    name: Deploy Crons to Lambda (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: crons-dist
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Package Lambda
        run: cd dist && zip -r ../lambda.zip .

      - name: Deploy to Lambda
        run: |
          aws lambda update-function-code \
            --function-name ${{ vars.LAMBDA_FUNCTION_CRON_STG }} \
            --zip-file fileb://lambda.zip

      - name: Wait for update
        run: |
          aws lambda wait function-updated \
            --function-name ${{ vars.LAMBDA_FUNCTION_CRON_STG }}

  deploy-assets:
    name: Deploy Assets to S3 (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync assets to S3
        run: aws s3 sync assets/ s3://${{ vars.S3_BUCKET_ASSETS_STG }} --delete

  migrate:
    name: Run DB Migrations (STG)
    runs-on: ubuntu-latest
    needs: ci
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Get DATABASE_URL from Secrets Manager
        run: |
          DB_URL=$(aws secretsmanager get-secret-value \
            --secret-id ${{ vars.SECRETS_MANAGER_STG }} \
            --query 'SecretString' --output text | jq -r '.DATABASE_URL')
          echo "DATABASE_URL=${DB_URL}" >> $GITHUB_ENV

      - name: Run migrations
        run: cd packages/api && bunx drizzle-kit migrate
```

> **Note** : pour que la migration fonctionne depuis GitHub Actions, il faut que RDS soit accessible (via un bastion, self-hosted runner dans le VPC, ou Lambda de migration).

---

## 6. Pipeline Deploy PRD

Fichier : `.github/workflows/deploy-prd.yml`

```yaml
name: Deploy Production

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: deploy-prd
  cancel-in-progress: false

jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  build-prd:
    name: Build for Production
    runs-on: ubuntu-latest
    needs: ci
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build UI library
        run: cd packages/ui && bun run build

      - name: Build Web (PRD)
        run: cd packages/web && bun run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL_PRD }}

      - name: Build Admin (PRD)
        run: cd packages/admin && bun run build

      - name: Build API for Lambda
        run: cd packages/api && bun run build:lambda

      - name: Build Crons for Lambda
        run: cd packages/crons && bun run build:lambda

      - uses: actions/upload-artifact@v4
        with:
          name: web-dist-prd
          path: packages/web/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: admin-dist-prd
          path: packages/admin/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: api-dist-prd
          path: packages/api/dist/
          retention-days: 1

      - uses: actions/upload-artifact@v4
        with:
          name: crons-dist-prd
          path: packages/crons/dist/
          retention-days: 1

  deploy-api:
    name: Deploy API to Lambda (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: api-dist-prd
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Package Lambda
        run: cd dist && zip -r ../lambda.zip .

      - name: Deploy to Lambda
        run: |
          aws lambda update-function-code \
            --function-name ${{ vars.LAMBDA_FUNCTION_API_PRD }} \
            --zip-file fileb://lambda.zip

      - name: Wait for update
        run: |
          aws lambda wait function-updated \
            --function-name ${{ vars.LAMBDA_FUNCTION_API_PRD }}

  deploy-web:
    name: Deploy Web to S3 (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: web-dist-prd
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET_WEB_PRD }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CF_DISTRIBUTION_WEB_PRD }} \
            --paths "/*"

  deploy-admin:
    name: Deploy Admin to S3 (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: admin-dist-prd
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ vars.S3_BUCKET_ADMIN_PRD }} --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CF_DISTRIBUTION_ADMIN_PRD }} \
            --paths "/*"

  deploy-crons:
    name: Deploy Crons to Lambda (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: crons-dist-prd
          path: dist/

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Package Lambda
        run: cd dist && zip -r ../lambda.zip .

      - name: Deploy to Lambda
        run: |
          aws lambda update-function-code \
            --function-name ${{ vars.LAMBDA_FUNCTION_CRON_PRD }} \
            --zip-file fileb://lambda.zip

      - name: Wait for update
        run: |
          aws lambda wait function-updated \
            --function-name ${{ vars.LAMBDA_FUNCTION_CRON_PRD }}

  deploy-assets:
    name: Deploy Assets to S3 (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Sync assets to S3
        run: aws s3 sync assets/ s3://${{ vars.S3_BUCKET_ASSETS_PRD }} --delete

  migrate:
    name: Run DB Migrations (PRD)
    runs-on: ubuntu-latest
    needs: build-prd
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Get DATABASE_URL from Secrets Manager
        run: |
          DB_URL=$(aws secretsmanager get-secret-value \
            --secret-id ${{ vars.SECRETS_MANAGER_PRD }} \
            --query 'SecretString' --output text | jq -r '.DATABASE_URL')
          echo "DATABASE_URL=${DB_URL}" >> $GITHUB_ENV

      - name: Run migrations
        run: cd packages/api && bunx drizzle-kit migrate
```

---

## 7. Pipeline Migrations DB

### Option A : Depuis GitHub Actions (ci-dessus)

Nécessite que RDS soit accessible depuis les runners GitHub. Solutions :

1. **Bastion SSH** : ajouter un step SSH tunnel avant la migration
2. **Self-hosted runner** dans le VPC
3. **Lambda de migration** dédiée

### Option B : Migration via Lambda (recommandé)

- [ ] Créer `curved-migrate-stg` et `curved-migrate-prd` :
  - Runtime : Node.js 22
  - VPC : même subnets privés que l'API
  - Timeout : 300 secondes
- [ ] Dans le workflow, invoquer la Lambda :
  ```yaml
  - name: Invoke migration Lambda
    run: |
      aws lambda invoke \
        --function-name curved-migrate-${ENV} \
        --payload '{}' \
        response.json
      cat response.json
  ```

---

## 8. Workflow complet

```
Feature branch push
    └─→ CI (lint + type-check + build)

develop/staging push
    └─→ CI
        └─→ Build STG artifacts
            ├─→ Deploy API → Lambda STG
            ├─→ Deploy Web → S3 STG → Invalidate CF
            ├─→ Deploy Admin → S3 STG → Invalidate CF
            ├─→ Deploy Crons → Lambda STG
            ├─→ Deploy Assets → S3 STG
            └─→ Run Migrations → RDS STG

main push / merge
    └─→ CI
        └─→ Build PRD artifacts
            └─→ [Approval required]
                ├─→ Deploy API → Lambda PRD
                ├─→ Deploy Web → S3 PRD → Invalidate CF
                ├─→ Deploy Admin → S3 PRD → Invalidate CF
                ├─→ Deploy Crons → Lambda PRD
                ├─→ Deploy Assets → S3 PRD
                └─→ Run Migrations → RDS PRD
```

---

## 9. Ordre d'implémentation

1. [ ] Configurer les secrets et variables dans GitHub
2. [ ] Créer les environments GitHub (`staging`, `production`)
3. [ ] Créer les scripts dans `infrastructure/scripts/` et les tester en local
4. [ ] Créer `.github/workflows/ci.yml` — tester sur une feature branch
5. [ ] Créer la branche `develop` (si pas déjà fait)
6. [ ] Créer `.github/workflows/deploy-stg.yml` — tester le deploy STG
7. [ ] Valider le deploy STG end-to-end (web + admin + api + crons + assets + db)
8. [ ] Créer `.github/workflows/deploy-prd.yml`
9. [ ] Configurer l'approval sur l'environment `production`
10. [ ] Premier deploy PRD
