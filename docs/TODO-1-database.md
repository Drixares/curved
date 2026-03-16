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

## Nouvelles tables

### Teams

- [ ] `teams` — id (uuid), name (varchar), description (text, nullable), createdAt, updatedAt
- [ ] `team_members` — id (uuid), teamId (fk → teams), userId (fk → user), role (`enum: 'owner' | 'member'`), joinedAt (timestamp)
- [ ] Index unique sur (teamId, userId)

### Invitations

- [ ] `invitations` — id (uuid), teamId (fk → teams), email (varchar), status (`enum: 'pending' | 'accepted' | 'declined'`), invitedBy (fk → user), createdAt
- [ ] Index unique sur (teamId, email) quand status = pending

### Projects

- [ ] `projects` — id (uuid), teamId (fk → teams), name (varchar), description (text, nullable), createdAt, updatedAt

### Tasks

- [ ] `tasks` — id (uuid), projectId (fk → projects), name (varchar), description (text, nullable), status (`enum: 'todo' | 'in_progress' | 'done'`), assigneeId (fk → user, nullable), createdAt, updatedAt

### Assets

- [ ] `assets` — id (uuid), taskId (fk → tasks), fileName (varchar), fileUrl (varchar), fileSize (integer), mimeType (varchar), uploadedBy (fk → user), createdAt

## Migrations

- [ ] Générer les migrations avec `bun run db:generate`
- [ ] Appliquer les migrations avec `bun run db:push`
- [ ] Vérifier le schéma avec `bun run db:studio`
