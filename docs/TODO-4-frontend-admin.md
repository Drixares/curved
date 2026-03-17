# TODO Phase 4 — Frontend Admin

> Package : `packages/admin`
> Port : 5174

---

## Routing & Auth

- [x] Configurer React Router dans `main.tsx`
- [x] Page de connexion admin (`/sign-in`)
- [x] Guard d'authentification + vérification du rôle admin
- [x] Redirection si non-admin vers une page d'erreur

> **Note :** L'auth admin utilise un système JWT custom (table `admin_user` séparée), pas better-auth.
> Identifiants par défaut : `admin@curved.dev` / `CurvedAdmin2026!`

## Pages

### Dashboard

- [x] `/` — dashboard avec statistiques globales :
  - Nombre total d'utilisateurs
  - Nombre total d'organisations
  - Nombre total d'équipes (teams)
  - Nombre total de projets
  - Nombre total d'issues
- [x] Cartes de statistiques avec icônes
- [ ] (Optionnel) Graphiques d'évolution

### Utilisateurs

- [x] `/users` — liste de tous les utilisateurs
- [x] Tableau avec colonnes : nom, email, vérifié, date d'inscription
- [x] Pagination
- [ ] (Optionnel) Recherche/filtre

### Backups

> Le cron de backup crée des entrées dans la table `backups`. L'admin peut les consulter.

- [ ] `/backups` — liste de tous les backups BDD
- [ ] Tableau avec colonnes : date, heure, nom du fichier, taille, lien S3
- [ ] Lien de téléchargement vers le fichier dans S3 (presigned URL)
- [ ] Pagination

---

## Composants

- [x] Layout admin (sidebar + header)
- [x] Stat card component
- [x] Data table component (réutilisable)

## Services

- [x] Client HTTP avec token JWT admin (`src/lib/api.ts`)
- [x] Stats via `@tanstack/react-query` (queryKey: `['admin', 'stats']`)
- [x] Users via `@tanstack/react-query` (queryKey: `['admin', 'users']`)
- [ ] `useAdminBackups()` — hook pour la liste des backups
