# Projet — Application Web de Gestion de Projet

## Contexte

- Application web de gestion de projet à concevoir et développer
- Objectif : créer une première version fonctionnelle de la plateforme
- L'application doit permettre à des équipes de collaborer sur des projets
- Architecture cloud serverless obligatoire

---

## User Stories

### Users

- En tant qu'utilisateur, je peux créer un compte avec un email unique afin d'accéder à la plateforme.
- En tant qu'utilisateur, je peux me connecter à mon compte afin d'accéder à mes équipes et mes projets.
- En tant qu'utilisateur, je peux consulter mon profil afin de voir mes informations.
- En tant qu'utilisateur, je peux modifier mon profil afin de mettre à jour mes informations.

### Teams

- En tant qu'utilisateur, je peux créer une équipe afin de collaborer avec d'autres utilisateurs.
- En tant qu'utilisateur, je peux consulter les équipes auxquelles j'appartiens afin d'accéder à leurs projets.
- En tant qu'utilisateur, je peux consulter les membres d'une équipe afin de savoir qui y participe.

### Invitations

- En tant que membre d'une équipe, je peux inviter un utilisateur à rejoindre l'équipe via son email afin de collaborer avec lui.
- En tant qu'utilisateur, je peux consulter mes invitations à rejoindre des équipes.
- En tant qu'utilisateur, je peux accepter une invitation afin de rejoindre l'équipe.
- En tant qu'utilisateur, je peux refuser une invitation afin de ne pas rejoindre l'équipe.

### Projects

- En tant que membre d'une équipe, je peux créer un projet dans une équipe afin d'organiser le travail de cette équipe.
- En tant qu'utilisateur, je peux consulter les projets d'une équipe.
- En tant que membre d'une équipe, je peux consulter le détail d'un projet afin de voir ses tâches.
- En tant que membre d'une équipe, je peux modifier un projet afin de mettre à jour ses informations.
- En tant que membre d'une équipe, je peux supprimer un projet.

### Tasks

- En tant que membre d'un projet, je peux créer une tâche dans un projet (nom, description, statut).
- En tant que membre d'un projet, je peux consulter les tâches d'un projet.
- En tant que membre d'un projet, je peux modifier une tâche.
- En tant que membre d'un projet, je peux supprimer une tâche.
- En tant que membre d'un projet, je peux assigner une tâche à un membre de l'équipe.
- En tant que membre d'un projet, je peux changer le statut d'une tâche (todo / in progress / done).

### Assets

- En tant que membre d'un projet, je peux uploader un fichier sur une tâche.
- En tant que membre d'un projet, je peux consulter les fichiers liés à une tâche.
- En tant que membre d'un projet, je peux supprimer un fichier lié à une tâche.

---

## Espace Admin

- Espace administrateur dédié, frontend séparé
- Accessible uniquement aux utilisateurs administrateurs

### Fonctionnalités

- Se connecter
- Consulter un dashboard avec statistiques globales (nombre total d'utilisateurs, d'équipes, de projets et de tâches)
- Consulter tous les utilisateurs de la plateforme

### Contraintes

- Les routes doivent être protégées
- Vérification que l'utilisateur possède le rôle admin

---

## Authentification

- Toute l'application doit utiliser JWT
- Lors du login, l'API retourne un token JWT
- Le token est envoyé dans les requêtes protégées
- Header attendu : `Authorization`
- Le JWT doit contenir l'id du user et doit expirer

### Utilisation

- Protéger les routes utilisateur
- Protéger les routes admin
- Identifier l'utilisateur connecté

---

## Stack Technique

### Cloud / Infrastructure

| Service            | Usage                                            |
| ------------------ | ------------------------------------------------ |
| Amazon S3          | Hébergement des frontends et stockage des assets |
| Amazon CloudFront  | Distribution des frontends                       |
| Amazon API Gateway | Exposition de l'API                              |
| AWS Lambda         | Exécution de l'API                               |
| Amazon RDS         | Base de données PostgreSQL                       |

### CI/CD

- GitLab
- GitLab CI/CD

### Environnements

- **STG** (staging)
- **PRD** (production)

### Frontend

- Framework frontend libre (React, Vue, etc.)
- CSS via Tailwind

### Backend

- Runtime : **Bun**
- Framework HTTP : **Hono**
- Authentification via JWT
- API REST centralisée

---

## Rendu

Par groupe de 3 maximum (1 dépôt par groupe est suffisant).

### À fournir

- Noms des membres du groupe
- Lien du repository public sur GitLab
- URL CloudFront Front User
- URL CloudFront Front Admin
- Lien d'une présentation vidéo de 10 min MAX par groupe pour montrer ce qui semble le plus pertinent

### À déposer sur DVL

> **ATTENTION** : Supprimer tous vos services AWS dans une semaine après le rendu (maintenir une liste avec tous les services actifs à supprimer).
