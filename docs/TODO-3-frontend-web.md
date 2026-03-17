# TODO Phase 3 — Frontend Web (User)

> Package : `packages/web`
> Framework : React + Vite + TailwindCSS + React Router

---

## Routing & Layout

- [x] Configurer React Router dans `main.tsx` (BrowserRouter)
- [ ] Créer un layout auth (`/sign-in`, `/sign-up`) — sans sidebar/navbar
- [ ] Créer un layout app (routes protégées) — avec sidebar/navbar
- [ ] Middleware/guard d'authentification — rediriger vers `/sign-in` si non connecté
- [ ] Rediriger vers `/dashboard` si déjà connecté sur les pages auth

## Pages

### Auth

- [x] `/sign-in` — page de connexion (email/password + OAuth Google & GitHub)
- [x] `/sign-up` — page d'inscription (name/email/password + OAuth)

### Dashboard

- [~] `/dashboard` — page d'accueil connecté (affiche le profil utilisateur, manque la liste des équipes)

### Profil

> US : consulter et modifier son profil

- [ ] `/profile` — consultation du profil
- [ ] `/profile/edit` — formulaire d'édition du profil (name, email)

### Équipes (Teams)

> US : créer une équipe, consulter ses équipes, voir les membres

- [ ] `/teams` — liste des équipes de l'utilisateur
- [ ] `/teams/new` — formulaire de création d'une équipe
- [ ] `/teams/:teamId` — détail d'une équipe (membres + projets)
- [ ] `/teams/:teamId/members` — gestion des membres

### Invitations

> US : inviter par email, consulter/accepter/refuser les invitations

- [ ] `/teams/:teamId/invite` — formulaire d'invitation (email)
- [ ] `/invitations` — liste des invitations reçues avec boutons accepter/refuser

### Projets

> US : créer/consulter/modifier/supprimer un projet dans une équipe

- [ ] `/teams/:teamId/projects/new` — formulaire de création d'un projet
- [ ] `/projects/:projectId` — détail d'un projet (vue tâches)
- [ ] `/projects/:projectId/edit` — formulaire d'édition

### Tâches

> US : CRUD tâches, assigner un membre, changer le statut (todo/in_progress/done)

- [ ] Vue kanban (3 colonnes : todo, in progress, done) dans la page projet
- [ ] Modal/formulaire de création d'une tâche (nom, description, statut)
- [ ] Modal/formulaire d'édition d'une tâche
- [ ] Drag & drop pour changer le statut (optionnel, peut être des boutons)
- [ ] Assignation d'un membre à une tâche (select parmi les membres de l'équipe)

### Assets (pièces jointes)

> US : uploader/consulter/supprimer un fichier sur une tâche

- [ ] Zone d'upload de fichiers dans le détail d'une tâche
- [ ] Liste des fichiers attachés avec bouton de suppression
- [ ] Aperçu/téléchargement des fichiers

---

## Composants partagés à créer

- [ ] Sidebar/navigation latérale
- [ ] Navbar avec avatar utilisateur et menu dropdown
- [ ] Empty state (quand il n'y a pas encore de données)
- [ ] Loading skeleton / spinner
- [ ] Confirmation dialog (pour les suppressions)
- [ ] Toast/notification pour les actions réussies ou échouées

## Services / Hooks

- [x] Auth client configuré via `better-auth/react` (`lib/auth-client.ts`) — `authClient.signIn`, `authClient.signUp`, `authClient.useSession`
- [ ] Configurer un client HTTP (fetch wrapper ou Hono RPC) avec le token/cookie
- [ ] Hooks pour chaque entité : `useTeams()`, `useProjects()`, `useTasks()`, `useAssets()`, `useInvitations()`
- [ ] Organisations/teams via `authClient.organization`
