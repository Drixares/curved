# TODO Phase 4 — Frontend Admin

> Package : `packages/admin`
> Port : 5174

---

## Routing & Auth

- [ ] Configurer React Router dans `main.tsx`
- [ ] Page de connexion admin (`/sign-in`)
- [ ] Guard d'authentification + vérification du rôle admin
- [ ] Redirection si non-admin vers une page d'erreur

## Pages

### Dashboard

- [ ] `/` — dashboard avec statistiques globales :
  - Nombre total d'utilisateurs
  - Nombre total d'équipes (teams)
  - Nombre total de projets
  - Nombre total de tâches
- [ ] Cartes de statistiques avec icônes
- [ ] (Optionnel) Graphiques d'évolution

### Utilisateurs

- [ ] `/users` — liste de tous les utilisateurs
- [ ] Tableau avec colonnes : nom, email, date d'inscription, rôle
- [ ] Pagination
- [ ] (Optionnel) Recherche/filtre

### Backups

> Le cron de backup crée des entrées dans la table `backups`. L'admin peut les consulter.

- [ ] `/backups` — liste de tous les backups BDD
- [ ] Tableau avec colonnes : date, heure, nom du fichier, taille, lien S3
- [ ] Lien de téléchargement vers le fichier dans S3 (presigned URL)
- [ ] Pagination

---

## Composants

- [ ] Layout admin (sidebar + header)
- [ ] Stat card component
- [ ] Data table component (réutilisable)

## Services

- [ ] Client HTTP avec token/cookie admin
- [ ] `useAdminStats()` — hook pour les statistiques
- [ ] `useAdminUsers()` — hook pour la liste des utilisateurs
- [ ] `useAdminBackups()` — hook pour la liste des backups
