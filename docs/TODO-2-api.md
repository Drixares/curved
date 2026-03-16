# TODO Phase 2 — API Routes

> Fichier principal : `packages/api/src/index.ts`
> Structure cible : `packages/api/src/routes/`, `packages/api/src/middleware/`

## Middleware

- [ ] Créer `middleware/auth.ts` — vérifier la session via better-auth, injecter l'utilisateur dans le contexte Hono
- [ ] Créer `middleware/admin.ts` — vérifier que l'utilisateur a le rôle `admin`
- [ ] Créer `middleware/org-member.ts` — vérifier que l'utilisateur est membre de l'organisation (via better-auth)

## Routes Users

- [ ] `GET /api/users/me` — retourner le profil de l'utilisateur connecté
- [ ] `PATCH /api/users/me` — modifier le profil (name, email)

## Organisations & Invitations (better-auth)

> Les routes organisations, membres et invitations sont gérées nativement par le plugin `organization()` de better-auth via `/api/auth/organization/*`.
> **Pas de routes custom à créer** — utiliser le client better-auth côté frontend.
>
> Fonctionnalités fournies par better-auth :
>
> - Créer / modifier / supprimer une organisation
> - Lister les organisations de l'utilisateur
> - Ajouter / retirer des membres
> - Changer les rôles (owner, admin, member)
> - Inviter par email, accepter / refuser une invitation

## Routes Projects

- [ ] `POST /api/organizations/:orgId/projects` — créer un projet dans une organisation
- [ ] `GET /api/organizations/:orgId/projects` — lister les projets d'une organisation
- [ ] `GET /api/projects/:projectId` — détail d'un projet
- [ ] `PATCH /api/projects/:projectId` — modifier un projet
- [ ] `DELETE /api/projects/:projectId` — supprimer un projet

## Routes Tasks

- [ ] `POST /api/projects/:projectId/tasks` — créer une tâche
- [ ] `GET /api/projects/:projectId/tasks` — lister les tâches d'un projet
- [ ] `GET /api/tasks/:taskId` — détail d'une tâche
- [ ] `PATCH /api/tasks/:taskId` — modifier une tâche (nom, description)
- [ ] `PATCH /api/tasks/:taskId/status` — changer le statut (todo/in_progress/done)
- [ ] `PATCH /api/tasks/:taskId/assign` — assigner à un membre
- [ ] `DELETE /api/tasks/:taskId` — supprimer une tâche

## Routes Assets

- [ ] `POST /api/tasks/:taskId/assets` — uploader un fichier (S3 presigned URL ou direct upload)
- [ ] `GET /api/tasks/:taskId/assets` — lister les fichiers d'une tâche
- [ ] `DELETE /api/assets/:assetId` — supprimer un fichier (S3 + BDD)

## Routes Admin

- [ ] `GET /api/admin/stats` — statistiques globales (count users, organisations, projects, tasks)
- [ ] `GET /api/admin/users` — lister tous les utilisateurs (pagination)
