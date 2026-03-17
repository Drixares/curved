# TODO Phase 5 — Infrastructure AWS

> Monorepo Bun avec packages : `@curved/api`, `@curved/crons`, `@curved/web`, `@curved/admin`, `@curved/ui`, `@curved/domain`
> Tous les scripts de déploiement doivent pouvoir être lancés en local ET en CI/CD.

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Prérequis](#2-prérequis)
3. [Amazon RDS (PostgreSQL)](#3-amazon-rds-postgresql)
4. [AWS Secrets Manager](#4-aws-secrets-manager)
5. [Amazon S3](#5-amazon-s3)
6. [AWS Lambda (API)](#6-aws-lambda-api)
7. [AWS Lambda (Crons)](#7-aws-lambda-crons)
8. [Amazon API Gateway](#8-amazon-api-gateway)
9. [Amazon CloudFront](#9-amazon-cloudfront)
10. [Amazon SES (branche séparée)](#10-amazon-ses-branche-séparée)
11. [Amazon CloudWatch (Logs)](#11-amazon-cloudwatch-logs)
12. [Réseau & Sécurité (VPC, SG, IAM)](#12-réseau--sécurité-vpc-sg-iam)
13. [Route 53 & Certificats SSL](#13-route-53--certificats-ssl)
14. [Modifications du code source](#14-modifications-du-code-source)
15. [Scripts de déploiement](#15-scripts-de-déploiement)
16. [Docker (dev container)](#16-docker-dev-container)
17. [Estimation des coûts](#17-estimation-des-coûts)

---

## 1. Vue d'ensemble de l'architecture

```
                    ┌─────────────┐
                    │  Route 53   │
                    │  DNS        │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼───┐    ┌────────▼───┐    ┌────────▼───┐
│ CloudFront │    │ CloudFront │    │ CloudFront │
│ web        │    │ admin      │    │ api        │
└────────┬───┘    └────────┬───┘    └────────┬───┘
         │                 │                 │
┌────────▼───┐    ┌────────▼───┐    ┌────────▼───┐
│ S3 Bucket  │    │ S3 Bucket  │    │API Gateway │
│ web        │    │ admin      │    │ HTTP API   │
└────────────┘    └────────────┘    └────┬───────┘
                                        │
                                  ┌─────▼─────┐
                                  │  Lambda   │
                                  │  Hono API │
                                  └─────┬─────┘
                                        │
               ┌────────────────────────┼────────────────┐
               │                        │                │
        ┌──────▼──────┐          ┌──────▼──────┐  ┌──────▼──────┐
        │   RDS       │          │   S3        │  │ CloudWatch  │
        │ PostgreSQL  │          │ assets +    │  │ Logs        │
        └─────────────┘          │ backups     │  └─────────────┘
                                 └─────────────┘

        ┌─────────────┐         ┌──────────────┐
        │ EventBridge │────────▶│ Lambda Cron  │
        │ (schedule)  │         │ (backup DB)  │
        └─────────────┘         └──────────────┘

        ┌─────────────┐
        │ Amazon SES  │  (branche séparée)
        │ (emails)    │
        └─────────────┘
```

**Environnements :**

- **STG** (staging)
- **PRD** (production)

---

## 2. Prérequis

- [ ] Créer un compte AWS (ou utiliser un compte existant)
- [ ] Installer et configurer AWS CLI (`aws configure`)
- [ ] Créer un utilisateur IAM dédié pour le déploiement (pas le root)
  - Permissions : `AmazonRDSFullAccess`, `AmazonS3FullAccess`, `AWSLambda_FullAccess`, `AmazonAPIGatewayAdministrator`, `CloudFrontFullAccess`, `SecretsManagerReadWrite`, `IAMFullAccess`, `AmazonVPCFullAccess`, `AmazonSESFullAccess`, `CloudWatchLogsFullAccess`, `AmazonEventBridgeFullAccess`
  - Générer des Access Keys pour le CLI et GitLab CI/CD
- [ ] Choisir la région AWS (recommandé : `eu-west-3` Paris)
- [ ] Installer les outils locaux :
  - `aws` CLI v2
  - `bun` (déjà installé)
  - `docker` (pour le dev container)

---

## 3. Amazon RDS (PostgreSQL)

### 3.1 Créer le subnet group

- [ ] Créer un **DB Subnet Group** avec au moins 2 subnets dans 2 AZ différentes
  - Nom : `curved-db-subnet-group`
  - VPC : le VPC dédié (voir section 12)

### 3.2 Créer l'instance RDS STG

- [ ] Configuration :
  - **Engine** : PostgreSQL 17
  - **Template** : Free tier
  - **Instance class** : `db.t3.micro`
  - **Storage** : 20 Go gp3
  - **DB instance identifier** : `curved-db-stg`
  - **Master username** : `curved_admin`
  - **Master password** : stocker dans Secrets Manager
  - **Database name** : `curved_stg`
  - **DB Subnet Group** : `curved-db-subnet-group`
  - **Public access** : Non
  - **VPC Security group** : `curved-rds-sg`
  - **Backup** : 7 jours rétention
  - **Encryption** : activé

### 3.3 Créer l'instance RDS PRD

- [ ] Même configuration que STG avec les différences :
  - **Instance class** : `db.t4g.small`
  - **DB instance identifier** : `curved-db-prd`
  - **Database name** : `curved_prd`
  - **Multi-AZ** : activé
  - **Storage** : 20 Go gp3 avec auto-scaling (max 100 Go)
  - **Backup** : 14 jours rétention
  - **Delete protection** : activé

### 3.4 Appliquer les migrations

- [ ] Utiliser le script `infrastructure/scripts/migrate.sh` (voir TODO-1)
- [ ] Tester sur STG puis PRD

---

## 4. AWS Secrets Manager

### 4.1 Créer le secret STG

- [ ] Nom : `curved/stg`
- [ ] Clés/valeurs :

| Clé                    | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | Connexion DB RDS STG                               |
| `BETTER_AUTH_SECRET`   | Clé de signature sessions/tokens (64 chars random) |
| `BETTER_AUTH_URL`      | `https://api-stg.curved.app`                       |
| `GOOGLE_CLIENT_ID`     | OAuth Google                                       |
| `GOOGLE_CLIENT_SECRET` | OAuth Google                                       |
| `GITHUB_CLIENT_ID`     | OAuth GitHub                                       |
| `GITHUB_CLIENT_SECRET` | OAuth GitHub                                       |
| `FRONTEND_URL`         | `https://stg.curved.app`                           |

### 4.2 Créer le secret PRD

- [ ] Nom : `curved/prd`
- [ ] Mêmes clés avec les valeurs production

### 4.3 Configuration OAuth

#### Google Cloud Console :

- [ ] Créer des credentials OAuth 2.0 :
  - **STG** : Redirect URI → `https://api-stg.curved.app/api/auth/callback/google`
  - **PRD** : Redirect URI → `https://api.curved.app/api/auth/callback/google`

#### GitHub OAuth App :

- [ ] Créer une app pour chaque env :
  - **STG** : Callback URL → `https://api-stg.curved.app/api/auth/callback/github`
  - **PRD** : Callback URL → `https://api.curved.app/api/auth/callback/github`

---

## 5. Amazon S3

### 5.1 Buckets pour les frontends

- [ ] `curved-web-stg` — Block all public access, accès via CloudFront (OAC)
- [ ] `curved-web-prd` — idem + versioning activé
- [ ] `curved-admin-stg` — idem
- [ ] `curved-admin-prd` — idem + versioning activé

### 5.2 Bucket policies CloudFront (OAC)

- [ ] Pour chaque bucket, ajouter la bucket policy OAC après création des distributions CloudFront

### 5.3 Bucket assets

- [ ] `curved-assets-stg` — pour les fichiers uploadés (assets tâches) + backups BDD
- [ ] `curved-assets-prd` — idem
- [ ] Configurer CORS pour les uploads directs via presigned URLs
- [ ] Configurer lifecycle policy pour les backups (rétention 30 jours STG, 90 jours PRD)

### 5.4 Bucket www-assets (assets statiques du site)

- [ ] `curved-www-assets-stg` — logos, images statiques du site
- [ ] `curved-www-assets-prd` — idem
- [ ] Accès via CloudFront ou public

---

## 6. AWS Lambda (API)

### 6.1 Adapter le code pour Lambda

- [ ] Créer `packages/api/src/app.ts` — extraire l'app Hono pure
- [ ] Modifier `packages/api/src/index.ts` — entry point dev (Bun, localhost)
- [ ] Créer `packages/api/src/lambda.ts` — entry point Lambda avec `hono/aws-lambda`
- [ ] Environnementaliser les URLs (baseURL, trustedOrigins, CORS)

### 6.2 Build pour Lambda

- [ ] Script de build dans `package.json` :
  ```json
  {
    "build:lambda": "bun build src/lambda.ts --outdir=dist --target=node --format=esm --minify",
    "package:lambda": "cd dist && zip -r ../lambda.zip . && cd .."
  }
  ```

### 6.3 Créer la fonction Lambda STG

- [ ] **Function name** : `curved-api-stg`
- [ ] **Runtime** : Node.js 22.x
- [ ] **Architecture** : arm64
- [ ] **Memory** : 512 Mo
- [ ] **Timeout** : 30 secondes
- [ ] **VPC** : subnets privés (accès RDS)
- [ ] **Security group** : `curved-lambda-sg`
- [ ] Variables d'environnement (depuis Secrets Manager ou directement)

### 6.4 Créer la fonction Lambda PRD

- [ ] **Function name** : `curved-api-prd`
- [ ] **Memory** : 1024 Mo
- [ ] **Provisioned concurrency** : 1-2

---

## 7. AWS Lambda (Crons)

### 7.1 Lambda Backup BDD

- [ ] Créer `packages/crons/src/backup.ts` — logique de dump PostgreSQL → S3
- [ ] Créer `packages/crons/src/lambda.ts` — handler Lambda
- [ ] Build et packaging similaire à l'API

### 7.2 Créer la fonction Lambda Cron

- [ ] **Function name** : `curved-cron-backup-stg` / `curved-cron-backup-prd`
- [ ] **Runtime** : Node.js 22.x
- [ ] **Architecture** : arm64
- [ ] **Memory** : 512 Mo
- [ ] **Timeout** : 300 secondes (5 min pour le dump)
- [ ] **VPC** : subnets privés (accès RDS)
- [ ] **Security group** : `curved-lambda-sg`

### 7.3 EventBridge (scheduling)

- [ ] Créer une règle EventBridge pour déclencher le cron toutes les heures
  - Rule name : `curved-backup-hourly-stg` / `curved-backup-hourly-prd`
  - Schedule expression : `rate(1 hour)`
  - Target : Lambda `curved-cron-backup-*`

### 7.4 Lancement local

- [ ] Le cron doit pouvoir être lancé en local :
  ```bash
  cd packages/crons && bun run src/index.ts
  ```

---

## 8. Amazon API Gateway

### 8.1 API HTTP STG

- [ ] **API name** : `curved-api-stg`
- [ ] **Integration** : Lambda → `curved-api-stg`
- [ ] **Routes** : `ANY /{proxy+}` et `ANY /`
- [ ] **Stage** : `$default` (auto-deploy)

### 8.2 API HTTP PRD

- [ ] Même configuration pour la production

### 8.3 CORS

- [ ] Laisser Hono gérer le CORS (déjà en place dans le code)

---

## 9. Amazon CloudFront

### 9.1 OAC (Origin Access Control)

- [ ] Créer `curved-s3-oac` pour l'accès S3

### 9.2 Distributions

| Distribution | Origin                | CNAME                  | Error pages SPA               |
| ------------ | --------------------- | ---------------------- | ----------------------------- |
| Web STG      | `curved-web-stg` S3   | `stg.curved.app`       | 403/404 → `/index.html` (200) |
| Web PRD      | `curved-web-prd` S3   | `curved.app`           | idem                          |
| Admin STG    | `curved-admin-stg` S3 | `admin-stg.curved.app` | idem                          |
| Admin PRD    | `curved-admin-prd` S3 | `admin.curved.app`     | idem                          |
| API STG      | API Gateway STG       | `api-stg.curved.app`   | non                           |
| API PRD      | API Gateway PRD       | `api.curved.app`       | non                           |

- [ ] Créer chaque distribution avec la configuration appropriée

---

## 10. Amazon SES (branche séparée)

> **À faire sur une branche Git séparée** (`feat/ses-emails`).
> Remplace Resend pour l'envoi d'emails (invitations, etc.)

### 10.1 Configuration SES

- [ ] Vérifier le domaine `curved.app` dans SES
- [ ] Configurer les records DNS (DKIM, SPF, DMARC)
- [ ] Sortir du sandbox SES (demande de production access)
- [ ] Configurer l'adresse d'envoi : `noreply@curved.app`

### 10.2 Intégration dans le code

- [ ] Installer `@aws-sdk/client-ses`
- [ ] Créer un service d'envoi d'email (`packages/api/src/lib/ses.ts`)
- [ ] Adapter les templates d'email existants (invitations)
- [ ] Ajouter les variables SES dans Secrets Manager si nécessaire

### 10.3 IAM

- [ ] Ajouter la permission `ses:SendEmail` au rôle Lambda

---

## 11. Amazon CloudWatch (Logs)

> Les Lambdas doivent remonter des logs dans CloudWatch.

### 11.1 Logs automatiques

- [ ] Les Lambda Functions envoient automatiquement `stdout`/`stderr` vers CloudWatch Logs
- [ ] Vérifier que le rôle IAM Lambda a la permission `AWSLambdaBasicExecutionRole` (inclut CloudWatch Logs)

### 11.2 Log groups

- [ ] Vérifier la création des log groups :
  - `/aws/lambda/curved-api-stg`
  - `/aws/lambda/curved-api-prd`
  - `/aws/lambda/curved-cron-backup-stg`
  - `/aws/lambda/curved-cron-backup-prd`
- [ ] Configurer la rétention : 14 jours (STG), 30 jours (PRD)

### 11.3 Logs structurés (optionnel mais recommandé)

- [ ] Utiliser `console.log(JSON.stringify({ ... }))` pour les logs structurés
- [ ] Ajouter un middleware Hono pour logger les requêtes (method, path, status, duration)

---

## 12. Réseau & Sécurité (VPC, SG, IAM)

### 12.1 VPC

- [ ] Créer `curved-vpc` : CIDR `10.0.0.0/16`
- [ ] Subnets :
  - `curved-public-a` (10.0.1.0/24) — NAT Gateway
  - `curved-public-b` (10.0.2.0/24) — NAT Gateway
  - `curved-private-a` (10.0.10.0/24) — Lambda, RDS
  - `curved-private-b` (10.0.11.0/24) — Lambda, RDS
- [ ] Internet Gateway + NAT Gateway (Elastic IP)
- [ ] Route tables (publique → IGW, privée → NAT)

### 12.2 Security Groups

#### `curved-lambda-sg`

- [ ] **Outbound** : TCP 5432 → `curved-rds-sg`, TCP 443 → `0.0.0.0/0`

#### `curved-rds-sg`

- [ ] **Inbound** : TCP 5432 depuis `curved-lambda-sg`

### 12.3 IAM Roles

- [ ] `curved-lambda-role-stg` / `curved-lambda-role-prd` :
  - `AWSLambdaVPCAccessExecutionRole`
  - Custom : lecture Secrets Manager
  - Custom : S3 (assets + backups)
  - Custom : SES (quand implémenté)

---

## 13. Route 53 & Certificats SSL

### 13.1 Certificats ACM

- [ ] Certificat dans `us-east-1` : `curved.app`, `*.curved.app` (pour CloudFront)
- [ ] Certificat dans la région principale (pour API Gateway)

### 13.2 Records DNS

| Record                 | Type      | Target               |
| ---------------------- | --------- | -------------------- |
| `stg.curved.app`       | A (alias) | CloudFront web STG   |
| `curved.app`           | A (alias) | CloudFront web PRD   |
| `admin-stg.curved.app` | A (alias) | CloudFront admin STG |
| `admin.curved.app`     | A (alias) | CloudFront admin PRD |
| `api-stg.curved.app`   | A (alias) | CloudFront API STG   |
| `api.curved.app`       | A (alias) | CloudFront API PRD   |

---

## 14. Modifications du code source

### 14.1 API — Séparer l'app Hono

- [ ] Créer `src/app.ts` (app Hono pure, partagée dev/Lambda)
- [ ] Modifier `src/index.ts` (entry point dev Bun)
- [ ] Créer `src/lambda.ts` (entry point Lambda)

### 14.2 API — Environnementaliser les URLs

- [ ] `baseURL` → `process.env.BETTER_AUTH_URL`
- [ ] `trustedOrigins` → `process.env.TRUSTED_ORIGINS.split(',')`
- [ ] CORS `origin` → `process.env.CORS_ORIGINS.split(',')`

### 14.3 Crons — Nouveau package

- [ ] Créer `packages/crons/` avec la structure Lambda
- [ ] Backup logic + Lambda handler

### 14.4 Frontends — Variables de build

- [ ] `VITE_API_URL` au moment du build pour chaque env

---

## 15. Scripts de déploiement

> Tous les scripts sont dans `infrastructure/scripts/` et doivent fonctionner en local ET en CI/CD.

### 15.1 `deploy-api.sh <env>`

- [ ] Build l'API Lambda (`bun run build:lambda`)
- [ ] Package le zip
- [ ] Upload sur AWS Lambda

### 15.2 `deploy-web.sh <env>`

- [ ] Build le frontend web (`bun run build` avec `VITE_API_URL`)
- [ ] Sync vers S3
- [ ] Invalider le cache CloudFront

### 15.3 `deploy-admin.sh <env>`

- [ ] Build le frontend admin
- [ ] Sync vers S3
- [ ] Invalider le cache CloudFront

### 15.4 `deploy-assets.sh <env>`

- [ ] Sync les assets statiques (logos, images) vers S3
- [ ] Invalider le cache CloudFront si applicable

### 15.5 `deploy-crons.sh <env>`

- [ ] Build le cron Lambda
- [ ] Package le zip
- [ ] Upload sur AWS Lambda

### 15.6 `migrate.sh <env>`

- [ ] Exécuter les migrations Drizzle sur la BDD RDS (voir TODO-1)

---

## 16. Docker (dev container)

> Dockerfile et docker-compose pour développer avec la stack complète en local.

- [ ] Créer/mettre à jour `docker-compose.yml` :
  - PostgreSQL 17 (+ pgvector)
  - Mailpit ou service de test email (dev)
- [ ] Créer un `Dockerfile` dev container (optionnel, pour standardiser l'env de dev)
- [ ] Vérifier que tous les services locaux (`bun run dev`, API, web, admin) fonctionnent avec Docker

---

## 17. Estimation des coûts

### STG (mensuel estimé)

| Service                      | Coût estimé      |
| ---------------------------- | ---------------- |
| RDS db.t3.micro              | ~15 $            |
| Lambda API + Crons           | ~2 $             |
| API Gateway                  | ~0.10 $          |
| S3 (6 buckets)               | ~0.10 $          |
| CloudFront (6 distributions) | ~2 $             |
| NAT Gateway                  | ~32 $            |
| Secrets Manager              | ~0.80 $          |
| SES                          | ~0 $ (free tier) |
| CloudWatch                   | ~0 $ (free tier) |
| **Total STG**                | **~52 $**        |

### PRD (mensuel estimé)

| Service                   | Coût estimé |
| ------------------------- | ----------- |
| RDS db.t4g.small Multi-AZ | ~50 $       |
| Lambda API + Crons        | ~10 $       |
| API Gateway               | ~0.50 $     |
| S3                        | ~0.20 $     |
| CloudFront                | ~10 $       |
| NAT Gateway               | ~32 $       |
| **Total PRD**             | **~103 $**  |

> **Note** : le NAT Gateway est le poste le plus cher. Alternative : NAT instance (t3.nano ~3$/mois).

---

## Ordre d'exécution recommandé

1. Docker + dev container (section 16)
2. Modifications du code source (section 14)
3. VPC, Subnets, Security Groups (section 12)
4. RDS PostgreSQL (section 3)
5. Secrets Manager (section 4)
6. IAM Roles (section 12.3)
7. Lambda API (section 6)
8. Lambda Crons (section 7)
9. API Gateway (section 8)
10. S3 Buckets (section 5)
11. ACM Certificates (section 13)
12. CloudFront Distributions (section 9)
13. Route 53 DNS (section 13)
14. CloudWatch Logs (section 11)
15. Scripts de déploiement (section 15)
16. Tests end-to-end sur STG
17. Reproduire pour PRD
18. SES emails (branche séparée, section 10)
