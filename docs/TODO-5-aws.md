# TODO Phase 5 — Infrastructure AWS

## Amazon RDS (PostgreSQL)

- [ ] Créer une instance RDS PostgreSQL (db.t3.micro pour commencer)
- [ ] Configurer le security group (accès depuis Lambda uniquement)
- [ ] Créer les bases de données STG et PRD
- [ ] Appliquer les migrations Drizzle sur RDS
- [ ] Stocker les credentials dans AWS Secrets Manager ou variables Lambda

## AWS Lambda (API)

- [ ] Packager l'API Hono pour Lambda (adapter Hono → Lambda handler)
  - Utiliser `hono/aws-lambda` ou `@hono/node-server` avec un wrapper
- [ ] Configurer le runtime (Bun sur Lambda via custom runtime ou Node.js)
- [ ] Créer la fonction Lambda STG
- [ ] Créer la fonction Lambda PRD
- [ ] Configurer les variables d'environnement :
  - `DATABASE_URL`
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
  - `BETTER_AUTH_SECRET`
- [ ] Configurer la mémoire et le timeout

## Amazon API Gateway

- [ ] Créer une API HTTP (API Gateway v2)
- [ ] Configurer l'intégration Lambda proxy
- [ ] Route catch-all `ANY /{proxy+}` → Lambda
- [ ] Configurer CORS (origines CloudFront)
- [ ] Déployer sur les stages STG et PRD

## Amazon S3

### Buckets frontends

- [ ] Créer le bucket `curved-web-stg` (hébergement statique)
- [ ] Créer le bucket `curved-web-prd`
- [ ] Créer le bucket `curved-admin-stg`
- [ ] Créer le bucket `curved-admin-prd`
- [ ] Configurer les bucket policies pour CloudFront (OAI/OAC)

### Bucket assets

- [ ] Créer le bucket `curved-assets-stg`
- [ ] Créer le bucket `curved-assets-prd`
- [ ] Configurer les policies pour l'upload depuis Lambda (presigned URLs)
- [ ] Configurer CORS pour les uploads directs (si applicable)

## Amazon CloudFront

### Distribution Web

- [ ] Créer la distribution pour le frontend web (STG)
- [ ] Créer la distribution pour le frontend web (PRD)
- [ ] Configurer l'origin vers le bucket S3
- [ ] Configurer le comportement SPA (redirection vers index.html pour les 404)
- [ ] Configurer le cache

### Distribution Admin

- [ ] Créer la distribution pour le frontend admin (STG)
- [ ] Créer la distribution pour le frontend admin (PRD)
- [ ] Même configuration que le web

### Configuration

- [ ] Configurer les error pages (403 → /index.html pour le routing SPA)
- [ ] Invalider le cache après chaque déploiement

## Réseau / Sécurité

- [ ] Créer un VPC dédié (ou utiliser le default)
- [ ] Configurer les subnets pour RDS
- [ ] Configurer les security groups :
  - Lambda → RDS (port 5432)
  - RDS accessible uniquement depuis Lambda
- [ ] Configurer IAM roles :
  - Lambda → accès RDS, S3
  - CloudFront → accès S3 (OAC)

## Scripts de déploiement

- [ ] Script de build + upload frontend web vers S3
- [ ] Script de build + upload frontend admin vers S3
- [ ] Script de package + deploy API vers Lambda
- [ ] Script d'invalidation CloudFront
- [ ] (Optionnel) Utiliser AWS CDK, SAM, ou Terraform pour l'IaC
