# TODO Phase 4 — Frontend Admin

> Package : `packages/admin`
> Port : 5174

## Routing & Auth

- [ ] Configurer React Router dans `main.tsx`
- [ ] Page de connexion admin (`/sign-in`)
- [ ] Guard d'authentification + vérification du rôle admin
- [ ] Redirection si non-admin vers une page d'erreur

## Pages

### Dashboard

- [ ] `/` — dashboard avec statistiques globales :
  - Nombre total d'utilisateurs
  - Nombre total d'équipes
  - Nombre total de projets
  - Nombre total de tâches
- [ ] Cartes de statistiques avec icônes
- [ ] (Optionnel) Graphiques d'évolution

### Utilisateurs

- [ ] `/users` — liste de tous les utilisateurs
- [ ] Tableau avec colonnes : nom, email, date d'inscription, rôle
- [ ] Pagination
- [ ] (Optionnel) Recherche/filtre

## Composants

- [ ] Layout admin (sidebar + header)
- [ ] Stat card component
- [ ] Data table component (réutilisable)

## Services

- [ ] Client HTTP avec token JWT admin
- [ ] `useAdminStats()` — hook pour les statistiques
- [ ] `useAdminUsers()` — hook pour la liste des utilisateurs
