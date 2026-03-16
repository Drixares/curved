# TODO Phase 2 — API Routes

> Fichier principal : `packages/api/src/index.ts`
> Structure cible : `packages/api/src/routes/`, `packages/api/src/middleware/`

## Middleware

- [ ] Créer `middleware/auth.ts` — vérifier le JWT via better-auth, injecter l'utilisateur dans le contexte Hono
- [ ] Créer `middleware/admin.ts` — vérifier que l'utilisateur a le rôle `admin`
- [ ] Créer `middleware/team-member.ts` — vérifier que l'utilisateur est membre de l'équipe

## Routes Users

- [ ] `GET /api/users/me` — retourner le profil de l'utilisateur connecté
- [ ] `PATCH /api/users/me` — modifier le profil (name, email)

## Routes Teams

- [ ] `POST /api/teams` — créer une équipe (l'utilisateur devient owner)
- [ ] `GET /api/teams` — lister les équipes de l'utilisateur connecté
- [ ] `GET /api/teams/:teamId` — détail d'une équipe
- [ ] `PATCH /api/teams/:teamId` — modifier une équipe (owner seulement)
- [ ] `DELETE /api/teams/:teamId` — supprimer une équipe (owner seulement)
- [ ] `GET /api/teams/:teamId/members` — lister les membres d'une équipe

## Routes Invitations

- [ ] `POST /api/teams/:teamId/invitations` — inviter un utilisateur par email
- [ ] `GET /api/invitations` — lister les invitations de l'utilisateur connecté
- [ ] `PATCH /api/invitations/:invitationId/accept` — accepter une invitation
- [ ] `PATCH /api/invitations/:invitationId/decline` — refuser une invitation

## Routes Projects

- [ ] `POST /api/teams/:teamId/projects` — créer un projet dans une équipe
- [ ] `GET /api/teams/:teamId/projects` — lister les projets d'une équipe
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

- [ ] `GET /api/admin/stats` — statistiques globales (count users, teams, projects, tasks)
- [ ] `GET /api/admin/users` — lister tous les utilisateurs (pagination)
