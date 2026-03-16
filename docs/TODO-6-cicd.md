# TODO Phase 6 — CI/CD & Environnements

## Migration vers GitLab

- [ ] Créer le repo sur GitLab
- [ ] Ajouter le remote GitLab (`git remote add gitlab ...`)
- [ ] Push le code sur GitLab
- [ ] Configurer les variables CI/CD dans GitLab (Settings → CI/CD → Variables) :
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `S3_BUCKET_WEB_STG` / `S3_BUCKET_WEB_PRD`
  - `S3_BUCKET_ADMIN_STG` / `S3_BUCKET_ADMIN_PRD`
  - `LAMBDA_FUNCTION_STG` / `LAMBDA_FUNCTION_PRD`
  - `CLOUDFRONT_DISTRIBUTION_WEB_STG` / `PRD`
  - `CLOUDFRONT_DISTRIBUTION_ADMIN_STG` / `PRD`
  - `DATABASE_URL_STG` / `DATABASE_URL_PRD`

## Pipeline `.gitlab-ci.yml`

### Stage : lint

- [ ] Installer les dépendances (`bun install`)
- [ ] Lancer Prettier (`bun run checks`)
- [ ] Lancer le type-check TypeScript

### Stage : build

- [ ] Build de `@curved/ui`
- [ ] Build de `@curved/web`
- [ ] Build de `@curved/admin`
- [ ] Build/package de `@curved/api`

### Stage : deploy-stg (automatique sur push vers `develop` ou `staging`)

- [ ] Upload du build web vers S3 STG
- [ ] Upload du build admin vers S3 STG
- [ ] Deploy de l'API vers Lambda STG
- [ ] Invalider le cache CloudFront STG
- [ ] Appliquer les migrations DB sur RDS STG

### Stage : deploy-prd (manuel, sur merge vers `main`)

- [ ] Upload du build web vers S3 PRD
- [ ] Upload du build admin vers S3 PRD
- [ ] Deploy de l'API vers Lambda PRD
- [ ] Invalider le cache CloudFront PRD
- [ ] Appliquer les migrations DB sur RDS PRD

## Gestion des branches

- [ ] `main` → production
- [ ] `develop` ou `staging` → staging
- [ ] Feature branches → CI uniquement (lint + build)
