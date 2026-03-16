# TODO Phase 3 — Frontend Web (User)

> Package : `packages/web`
> Dépendance à ajouter : react-router-dom (déjà installé)

## Routing & Layout

- [ ] Configurer React Router dans `main.tsx` (BrowserRouter ou createBrowserRouter)
- [ ] Créer un layout auth (`/sign-in`, `/sign-up`) — sans sidebar/navbar
- [ ] Créer un layout app (routes protégées) — avec sidebar/navbar
- [ ] Middleware/guard d'authentification — rediriger vers `/sign-in` si non connecté
- [ ] Rediriger vers `/dashboard` si déjà connecté sur les pages auth

## Pages

### Dashboard

- [ ] `/dashboard` — page d'accueil connecté, liste des équipes de l'utilisateur

### Profil

- [ ] `/profile` — consultation du profil
- [ ] `/profile/edit` — formulaire d'édition du profil

### Équipes

- [ ] `/teams` — liste des équipes
- [ ] `/teams/new` — formulaire de création d'une équipe
- [ ] `/teams/:teamId` — détail d'une équipe (membres + projets)
- [ ] `/teams/:teamId/members` — gestion des membres
- [ ] `/teams/:teamId/invite` — formulaire d'invitation

### Invitations

- [ ] `/invitations` — liste des invitations reçues avec boutons accepter/refuser

### Projets

- [ ] `/teams/:teamId/projects/new` — formulaire de création d'un projet
- [ ] `/projects/:projectId` — détail d'un projet (vue tâches)
- [ ] `/projects/:projectId/edit` — formulaire d'édition

### Tâches

- [ ] Vue kanban (3 colonnes : todo, in progress, done) dans la page projet
- [ ] Modal/formulaire de création d'une tâche
- [ ] Modal/formulaire d'édition d'une tâche
- [ ] Drag & drop pour changer le statut (optionnel, peut être des boutons)
- [ ] Assignation d'un membre à une tâche (select)

### Assets

- [ ] Zone d'upload de fichiers dans le détail d'une tâche
- [ ] Liste des fichiers attachés avec bouton de suppression
- [ ] Aperçu/téléchargement des fichiers

## Composants partagés à créer

- [ ] Sidebar/navigation latérale
- [ ] Navbar avec avatar utilisateur et menu dropdown
- [ ] Empty state (quand il n'y a pas encore de données)
- [ ] Loading skeleton / spinner
- [ ] Confirmation dialog (pour les suppressions)
- [ ] Toast/notification pour les actions réussies ou échouées

## Services / Hooks

- [ ] `useAuth()` — hook pour récupérer l'utilisateur connecté
- [ ] Configurer un client HTTP (fetch wrapper ou bibliothèque) avec le token JWT
- [ ] Hooks pour chaque entité : `useTeams()`, `useProjects()`, `useTasks()`, etc.
