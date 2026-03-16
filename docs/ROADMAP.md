# Roadmap — Curved

## État actuel

- Monorepo Bun avec 4 packages : `api`, `web`, `admin`, `ui`
- PostgreSQL local via Docker Compose
- Drizzle ORM configuré avec tables better-auth (user, session, account, verification)
- Authentification email/password + OAuth (Google, GitHub) via better-auth
- Pages sign-in et sign-up créées (web)
- Bibliothèque UI partagée avec 16+ composants (shadcn/Tailwind)
- Admin : maquette statique du dashboard
- Pas de routing React Router configuré
- Aucune route API métier (teams, projects, tasks, assets)
- Aucune infrastructure AWS

---

## Phase 1 — Base de données & Schéma

Étendre le schéma Drizzle pour couvrir toutes les entités métier.

1. Table `teams` (id, name, createdAt, updatedAt)
2. Table `team_members` (teamId, userId, role, joinedAt)
3. Table `invitations` (id, teamId, email, status, invitedBy, createdAt)
4. Table `projects` (id, teamId, name, description, createdAt, updatedAt)
5. Table `tasks` (id, projectId, name, description, status, assigneeId, createdAt, updatedAt)
6. Table `assets` (id, taskId, fileName, fileUrl, fileSize, uploadedBy, createdAt)
7. Ajouter un champ `role` (user/admin) sur la table `user` existante
8. Générer et appliquer les migrations

---

## Phase 2 — API Routes

Créer toutes les routes REST sur Hono avec middlewares d'auth.

1. **Middleware auth** — vérifier le JWT, extraire l'utilisateur, protéger les routes
2. **Users** — GET/PATCH `/api/users/me` (profil)
3. **Teams** — CRUD `/api/teams`, GET `/api/teams/:id/members`
4. **Invitations** — POST `/api/teams/:id/invitations`, GET `/api/invitations`, PATCH `/api/invitations/:id` (accept/refuse)
5. **Projects** — CRUD `/api/teams/:id/projects`, GET/PATCH/DELETE `/api/projects/:id`
6. **Tasks** — CRUD `/api/projects/:id/tasks`, PATCH `/api/tasks/:id/status`, PATCH `/api/tasks/:id/assign`
7. **Assets** — POST/GET/DELETE `/api/tasks/:id/assets` (upload S3)
8. **Admin** — GET `/api/admin/stats`, GET `/api/admin/users` (protégé par rôle admin)

---

## Phase 3 — Frontend Web (User)

Construire l'interface utilisateur complète avec React Router.

1. **Routing** — configurer React Router (layout auth, layout app, routes protégées)
2. **Dashboard** — page d'accueil connecté (liste des équipes)
3. **Profil** — consultation et édition du profil utilisateur
4. **Équipes** — création, liste, détail d'une équipe, gestion des membres
5. **Invitations** — liste, accepter/refuser
6. **Projets** — création, liste, détail, édition, suppression
7. **Tâches** — board kanban (todo/in progress/done), création, édition, assignation, suppression
8. **Assets** — upload de fichiers sur une tâche, consultation, suppression

---

## Phase 4 — Frontend Admin

Connecter le dashboard admin à l'API réelle.

1. **Auth admin** — connexion avec vérification du rôle admin
2. **Dashboard** — statistiques globales (users, teams, projects, tasks)
3. **Utilisateurs** — liste de tous les utilisateurs avec détails
4. **Routes protégées** — middleware de vérification admin côté client

---

## Phase 5 — Infrastructure AWS

Déployer toute l'application sur AWS.

1. **Amazon RDS** — créer une instance PostgreSQL (staging + production)
2. **AWS Lambda** — packager et déployer l'API Hono avec le runtime Bun
3. **Amazon API Gateway** — exposer l'API Lambda via HTTP
4. **Amazon S3** — buckets pour les frontends (web + admin) et les assets (fichiers uploadés)
5. **Amazon CloudFront** — distributions pour servir les frontends (2 URLs CloudFront)
6. **Variables d'environnement** — configurer les secrets (DB, OAuth, JWT) sur Lambda
7. **CORS** — configurer API Gateway et CloudFront pour les domaines de production

---

## Phase 6 — CI/CD & Environnements

Mettre en place le pipeline de déploiement continu.

1. **Migrer vers GitLab** — push du repo sur GitLab
2. **Pipeline CI** — lint, type-check, build sur chaque push
3. **Pipeline CD staging** — déploiement automatique sur l'env STG
4. **Pipeline CD production** — déploiement sur l'env PRD (manual trigger ou merge sur main)
5. **Environnements** — variables STG et PRD séparées

---

## Phase 7 — Finalisation & Rendu

1. Tests manuels end-to-end sur STG puis PRD
2. Créer la liste des services AWS actifs (pour suppression post-rendu)
3. Préparer la vidéo de présentation (10 min max)
4. Déposer le rendu (lien GitLab, URLs CloudFront, vidéo)
