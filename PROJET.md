# Projet — Application Web de Gestion de Projet

## Contexte

- Application web de gestion de projet a concevoir et developper
- Objectif : creer une premiere version fonctionnelle de la plateforme
- L'application doit permettre a des equipes de collaborer sur des projets
- Le projet devra etre developpe avec une architecture cloud serverless

---

## User Stories

### Users

- [x] En tant qu'utilisateur, je peux creer un compte avec un email unique afin d'acceder a la plateforme.
- [x] En tant qu'utilisateur, je peux me connecter a mon compte afin d'acceder a mes equipes et mes projets.
- [x] En tant qu'utilisateur, je peux consulter mon profil afin de voir mes informations.
- [x] En tant qu'utilisateur, je peux modifier mon profil afin de mettre a jour mes informations.

### Teams

- [x] En tant qu'utilisateur, je peux creer une equipe afin de collaborer avec d'autres utilisateurs.
- [x] En tant qu'utilisateur, je peux consulter les equipes auxquelles j'appartiens afin d'acceder a leurs projets.
- [x] En tant qu'utilisateur, je peux consulter les membres d'une equipe afin de savoir qui y participe.

### Invitations

- [x] En tant que membre d'une equipe, je peux inviter un utilisateur a rejoindre l'equipe via son email afin de collaborer avec lui.
- [x] En tant qu'utilisateur, je peux consulter mes invitations a rejoindre des equipes.
- [x] En tant qu'utilisateur, je peux accepter une invitation afin de rejoindre l'equipe.
- [x] En tant qu'utilisateur, je peux refuser une invitation afin de ne pas rejoindre l'equipe.

### Projects

- [x] En tant que membre d'une equipe, je peux creer un projet dans une equipe afin d'organiser le travail de cette equipe.
- [x] En tant qu'utilisateur, je peux consulter les projets d'une equipe.
- [x] En tant que membre d'une equipe, je peux consulter le detail d'un projet afin de voir ses taches.
- [x] En tant que membre d'une equipe, je peux modifier un projet afin de mettre a jour ses informations.
- [ ] En tant que membre d'une equipe, je peux supprimer un projet.

### Tasks

- [x] En tant que membre d'un projet, je peux creer une tache dans un projet (nom, description, statut).
- [x] En tant que membre d'un projet, je peux consulter les taches d'un projet.
- [x] En tant que membre d'un projet, je peux modifier une tache.
- [ ] En tant que membre d'un projet, je peux supprimer une tache.
- [x] En tant que membre d'un projet, je peux assigner une tache a un membre de l'equipe.
- [x] En tant que membre d'un projet, je peux changer le statut d'une tache (todo / in progress / done).

### Assets

- [ ] En tant que membre d'un projet, je peux uploader un fichier sur une tache.
- [ ] En tant que membre d'un projet, je peux consulter les fichiers lies a une tache.
- [ ] En tant que membre d'un projet, je peux supprimer un fichier lie a une tache.

---

## Espace Admin

- Espace administrateur dedie, frontend separe
- Accessible uniquement aux utilisateurs administrateurs

### Fonctionnalites

- [x] Se connecter
- [x] Consulter un dashboard avec statistiques globales (nombre total d'utilisateurs, d'equipes, de projets et de taches)
- [x] Consulter tous les utilisateurs de la plateforme

### Contraintes

- [x] Les routes doivent etre protegees
- [x] Verification que l'utilisateur possede le role admin

---

## Authentification

- Toute l'application doit utiliser JWT
- Lors du login, l'API retourne un token JWT
- Le token est envoye dans les requetes protegees
- Header attendu : `Authorization`
- Le JWT doit contenir l'id du user et doit expirer

### Utilisation

- [x] Proteger les routes utilisateur
- [x] Proteger les routes admin
- [x] Identifier l'utilisateur connecte

---

## Features supplementaires (Challenges)

- [ ] Envoyer un mail d'invitation a une team via le service SES (+ var dynamique) — **Page SES separee, on garde Resend pour le reste**
- [x] Creer un cron qui se lance toutes les heures pour faire un backup de la base de donnee dans un S3
- [ ] Voir la liste des backups dans l'espace admin (date, heure, lien vers le fichier dans le S3)

> Note : Le front n'est pas tres important (priorite backend/infra)

---

## Contraintes techniques supplementaires

- [x] Reprendre la meme structure de repo que le cours dernier
- [ ] ~~ORM interdit (script de migrations manuel)~~ — **On utilise Drizzle ORM**
- [x] Tous les scripts de CI/CD doivent pouvoir etre lances en local
- [x] Les lambdas hono doivent pouvoir se lancer en local sur un port du localhost
- [ ] Il faut faire remonter des logs dans AWS CloudWatch
- [ ] ~~Les donnees des users doivent etre detenu par le service Cognito~~ — **On garde better-auth**

---

## Structure de la base de donnees

### Tables principales

- users
- teams
- team_members
- invitations
- projects
- tasks
- assets
- backups

### Relations

- Un user peut appartenir a plusieurs teams
- Une team possede plusieurs members
- Une team possede plusieurs projects
- Un project appartient a une team
- Un project possede plusieurs tasks
- Une task peut etre assignee a un user
- Une task peut contenir plusieurs assets
- Une team peut envoyer plusieurs invitations

### Contraintes importantes

- users.email doit etre unique
- Une invitation est liee a un email
- Une task doit appartenir a un project
- Un project doit appartenir a une team

---

## Endpoints API

### Auth & Users

- `POST /users` — Inscription
- `POST /auth/login` — Connexion
- `GET /me` — Profil utilisateur connecte
- `PATCH /me` — Modifier profil

### Teams

- `POST /teams` — Creer une equipe
- `GET /teams` — Lister mes equipes
- `GET /teams/:teamId` — Detail d'une equipe
- `GET /teams/:teamId/members` — Membres d'une equipe
- `POST /teams/:teamId/invitations` — Inviter un membre

### Invitations

- `GET /invitations` — Mes invitations
- `POST /invitations/:invitationId/accept` — Accepter
- `POST /invitations/:invitationId/reject` — Refuser

### Projects

- `POST /teams/:teamId/projects` — Creer un projet
- `GET /teams/:teamId/projects` — Lister les projets d'une equipe
- `GET /projects/:projectId` — Detail d'un projet
- `PATCH /projects/:projectId` — Modifier un projet
- `DELETE /projects/:projectId` — Supprimer un projet

### Tasks

- `POST /projects/:projectId/tasks` — Creer une tache
- `GET /projects/:projectId/tasks` — Lister les taches d'un projet
- `GET /tasks/:taskId` — Detail d'une tache
- `PATCH /tasks/:taskId` — Modifier une tache
- `DELETE /tasks/:taskId` — Supprimer une tache
- `PATCH /tasks/:taskId/assign` — Assigner une tache
- `PATCH /tasks/:taskId/status` — Changer le statut

### Assets

- `POST /tasks/:taskId/assets` — Uploader un fichier
- `GET /tasks/:taskId/assets` — Lister les fichiers
- `DELETE /assets/:assetId` — Supprimer un fichier

### Admin

- `GET /admin/users` — Liste des utilisateurs
- `GET /admin/stats` — Statistiques globales
- `GET /admin/backups` — Liste des backups

---

## Stack Technique

### Cloud / Infrastructure

| Service            | Usage                                            |
| ------------------ | ------------------------------------------------ |
| Amazon S3          | Hebergement des frontends et stockage des assets |
| Amazon CloudFront  | Distribution des frontends                       |
| Amazon API Gateway | Exposition de l'API                              |
| AWS Lambda         | Execution de l'API et des crons                  |
| Amazon RDS         | Base de donnees PostgreSQL                       |
| Amazon SES         | Envoi de mails (page separee)                    |

> **Choix projet** : On garde **better-auth** (pas Cognito) et **Resend** (SES en demo separee)

### CI/CD

- **GitHub** (pas GitLab)
- **GitHub Actions**

### Environnements

- **STG** (staging)
- **PRD** (production)

### Frontend

- React 19 + React Router 7
- CSS via Tailwind 4

### Backend

- Runtime : **Bun**
- Framework HTTP : **Hono**
- ORM : **Drizzle**
- Authentification via **better-auth** (JWT)
- API REST centralisee

---

## Structure technique principale

```
packages/api          — API Hono + Lambda
packages/crons        — Crons Lambda
packages/web          — Frontend User (React)
packages/admin        — Frontend Admin (React)
packages/ui           — Composants UI partages
infrastructure/scripts — Scripts de deploiement
```

### Scripts requis

- [x] Script deploy **front** (web + admin)
- [x] Script deploy **assets**
- [x] Script de **migrations** de base de donnees
- [x] Script deploy **api**
- [x] Script deploy **crons**
- [x] Dockerfile et Docker-compose avec la **stack complete** pour developper

---

## Guidage du projet (ordre conseille)

1. [x] Creer le repository Git
2. [x] Mettre en place l'infrastructure cloud
3. [x] Creer les scripts requis dans /infrastructure/scripts
4. [x] Mettre en place les environnements
5. [x] Mettre en place les migrations de base de donnees
6. [x] Mettre en place la CI/CD
7. [x] Deploy une version vide de l'infrastructure
8. [x] Developper l'API
9. [x] Developper le Cron
10. [x] Developper le Front User
11. [x] Developper le Front Admin

---

## Rendu

Par groupe de 3 maximum (1 depot par groupe est suffisant).

### A fournir

- Noms des membres du groupe
- Lien du repository public sur GitHub
- URLs CloudFront Front User **(stg et prd)**
- URLs CloudFront Front Admin **(stg et prd)**
- Screens AWS pour tous les services utilises

> **ATTENTION** : Supprimer tous vos services AWS dans une semaine apres le rendu (maintenir une liste avec tous les services actifs a supprimer).
