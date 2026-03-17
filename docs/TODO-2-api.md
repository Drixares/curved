# TODO Phase 2 — API Routes & Crons

> Fichier principal : `packages/api/src/index.ts`
> Structure cible : `packages/api/src/routes/`, `packages/api/src/middleware/`

---

## Middleware

- [ ] Créer `middleware/auth.ts` — vérifier la session via better-auth, injecter l'utilisateur dans le contexte Hono
- [ ] Créer `middleware/admin.ts` — vérifier que l'utilisateur a le rôle `admin`
- [ ] Créer `middleware/org-member.ts` — vérifier que l'utilisateur est membre de l'organisation (team)

## Routes Auth & Users

> L'auth est gérée par better-auth. Les routes `/api/auth/*` sont automatiques.
> Routes custom pour le profil utilisateur :

- [ ] `GET /me` — retourner le profil de l'utilisateur connecté
- [ ] `PATCH /me` — modifier le profil (name, email)

## Organisations / Teams & Invitations (better-auth)

> Les routes organisations, membres et invitations sont gérées nativement par le plugin `organization()` de better-auth via `/api/auth/organization/*`.
> **Pas de routes custom à créer** — utiliser le client better-auth côté frontend.
>
> Fonctionnalités fournies par better-auth :
>
> - Créer / modifier / supprimer une organisation (team)
> - Lister les organisations de l'utilisateur
> - Ajouter / retirer des membres
> - Changer les rôles (owner, admin, member)
> - Inviter par email, accepter / refuser une invitation

### Routes custom invitations (si non couvertes par better-auth)

- [ ] `POST /teams/:teamId/invitations` — inviter un utilisateur par email
- [ ] `GET /invitations` — lister les invitations reçues par l'utilisateur connecté
- [ ] `POST /invitations/:invitationId/accept` — accepter une invitation
- [ ] `POST /invitations/:invitationId/reject` — refuser une invitation

## Routes Projects

- [ ] `POST /teams/:teamId/projects` — créer un projet dans une équipe
- [ ] `GET /teams/:teamId/projects` — lister les projets d'une équipe
- [ ] `GET /projects/:projectId` — détail d'un projet
- [ ] `PATCH /projects/:projectId` — modifier un projet
- [ ] `DELETE /projects/:projectId` — supprimer un projet

## Routes Tasks

- [ ] `POST /projects/:projectId/tasks` — créer une tâche
- [ ] `GET /projects/:projectId/tasks` — lister les tâches d'un projet
- [ ] `GET /tasks/:taskId` — détail d'une tâche
- [ ] `PATCH /tasks/:taskId` — modifier une tâche (nom, description)
- [ ] `PATCH /tasks/:taskId/status` — changer le statut (todo / in_progress / done)
- [ ] `PATCH /tasks/:taskId/assign` — assigner à un membre de l'équipe
- [ ] `DELETE /tasks/:taskId` — supprimer une tâche

## Routes Assets

- [ ] `POST /tasks/:taskId/assets` — uploader un fichier (S3 presigned URL)
- [ ] `GET /tasks/:taskId/assets` — lister les fichiers d'une tâche
- [ ] `DELETE /assets/:assetId` — supprimer un fichier (S3 + BDD)

## Routes Admin

> Auth admin séparée de better-auth : table `admin_user` + JWT custom.
> Routes dans `packages/api/src/routes/admin.ts`.

- [x] `POST /admin/login` — connexion admin (email + password → JWT)
- [x] `GET /admin/me` — profil admin (vérifié via JWT)
- [x] `GET /admin/stats` — statistiques globales (count users, orgs, teams, projects, issues)
- [x] `GET /admin/users` — lister tous les utilisateurs (pagination)
- [ ] `GET /admin/backups` — lister tous les backups BDD (date, heure, lien S3)

---

## Crons

> Package séparé : `packages/crons`
> Runtime : Lambda + EventBridge (CloudWatch Events) pour le scheduling

### Backup BDD

- [ ] Créer `packages/crons/` avec la structure Hono/Lambda
- [ ] Cron toutes les heures : dump de la BDD PostgreSQL → fichier SQL/gzip → upload S3
- [ ] Stocker les métadonnées du backup dans la table `backups` (fileName, fileUrl, fileSize, createdAt)
- [ ] Le cron doit pouvoir se lancer en local (`bun run cron:backup`)

### Structure packages/crons

```
packages/crons/
├── src/
│   ├── backup.ts        # Logique du backup
│   ├── lambda.ts        # Entry point Lambda
│   └── index.ts         # Entry point local (dev)
├── package.json
└── tsconfig.json
```

### Shared domain (optionnel)

> Si de la logique métier est partagée entre `api` et `crons`, la mettre dans un package partagé.

- [ ] Créer `packages/domain/` pour la logique partagée (accès DB, helpers, types)
- [ ] Importer depuis `@curved/domain` dans `api` et `crons`

---

## Récapitulatif des endpoints

```
POST   /api/auth/*                    (better-auth)
GET    /me
PATCH  /me
POST   /teams/:teamId/invitations
GET    /invitations
POST   /invitations/:invitationId/accept
POST   /invitations/:invitationId/reject
POST   /teams/:teamId/projects
GET    /teams/:teamId/projects
GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
POST   /projects/:projectId/tasks
GET    /projects/:projectId/tasks
GET    /tasks/:taskId
PATCH  /tasks/:taskId
DELETE /tasks/:taskId
PATCH  /tasks/:taskId/assign
PATCH  /tasks/:taskId/status
POST   /tasks/:taskId/assets
GET    /tasks/:taskId/assets
DELETE /assets/:assetId
GET    /admin/stats
GET    /admin/users
GET    /admin/backups
```
