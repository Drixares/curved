# TODO Phase 1 — Base de données & Schéma

> Fichier : `packages/api/src/db/schema.ts`
> Commandes : `bun run db:generate`, `bun run db:push`

---

## Schéma existant (better-auth)

- [x] Table `user` (better-auth)
- [x] Table `session` (better-auth)
- [x] Table `account` (better-auth)
- [x] Table `verification` (better-auth)

## Modifications sur les tables existantes

- [ ] Ajouter le champ `role` (`enum: 'user' | 'admin'`, default `'user'`) sur la table `user`

## Tables better-auth (plugin organization)

> Les tables `organization`, `member` et `invitation` sont gérées automatiquement par le plugin `organization()` de better-auth.
> Elles sont générées via `db:push` / `db:generate` — **ne pas les créer manuellement**.

- [x] `organization` — id, name, slug, metadata, createdAt
- [x] `member` — id, organizationId, userId, role (owner/admin/member), createdAt
- [x] `invitation` — id, organizationId, email, role, status, invitedBy, expiresAt, createdAt

## Nouvelles tables custom

### Projects

- [ ] `projects` — id (uuid), organizationId (fk → organization), name (varchar), description (text, nullable), createdAt, updatedAt

### Tasks

- [ ] `tasks` — id (uuid), projectId (fk → projects), name (varchar), description (text, nullable), status (`enum: 'todo' | 'in_progress' | 'done'`), assigneeId (fk → user, nullable), createdAt, updatedAt

### Assets

- [ ] `assets` — id (uuid), taskId (fk → tasks), fileName (varchar), fileUrl (varchar), fileSize (integer), mimeType (varchar), uploadedBy (fk → user), createdAt

### Backups

- [ ] `backups` — id (uuid), fileName (varchar), fileUrl (varchar), fileSize (integer), createdAt

> Table pour stocker les métadonnées des backups BDD réalisés par le cron.
> Le fichier de backup est stocké dans S3, la table ne contient que la référence.

---

## Script de migration pour la BDD hébergée (RDS)

> Le projet utilise **Drizzle ORM**. Il faut un script de migration exécutable en local et en CI/CD pour appliquer les migrations sur la BDD RDS (STG et PRD).

- [ ] Créer `infrastructure/scripts/migrate.sh` :

  ```bash
  #!/bin/bash
  # migrate.sh <env>
  # Utilisable en local et en CI/CD
  ENV=${1:-stg}

  if [ "$CI" = "true" ]; then
    # En CI/CD : récupérer depuis les variables d'environnement GitLab
    DB_URL="$DATABASE_URL"
  else
    # En local : récupérer depuis Secrets Manager ou .env
    DB_URL=$(aws secretsmanager get-secret-value \
      --secret-id "curved/${ENV}" \
      --query 'SecretString' --output text | jq -r '.DATABASE_URL')
  fi

  cd packages/api
  DATABASE_URL="${DB_URL}" bunx drizzle-kit migrate
  ```

- [ ] Rendre le script exécutable (`chmod +x`)
- [ ] Tester en local avec la BDD Docker
- [ ] Tester sur la BDD RDS STG

## Migrations locales (développement)

- [x] Générer les migrations avec `bun run db:generate`
- [x] Appliquer les migrations avec `bun run db:push`
- [x] Vérifier le schéma avec `bun run db:studio`

## Relations attendues (récapitulatif)

```
user ──< member >── organization (team)
organization ──< invitation
organization ──< projects
projects ──< tasks
tasks ──< assets
tasks >── user (assignee)
assets >── user (uploadedBy)
```
