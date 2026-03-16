# TODO Phase 1 — Base de données & Schéma

> Fichier : `packages/api/src/db/schema.ts`
> Commandes : `bun run db:generate`, `bun run db:push`

## Schéma existant

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

## Migrations

- [ ] Générer les migrations avec `bun run db:generate`
- [ ] Appliquer les migrations avec `bun run db:push`
- [ ] Vérifier le schéma avec `bun run db:studio`
