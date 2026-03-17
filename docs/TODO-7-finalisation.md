# TODO Phase 7 — Finalisation & Rendu

---

## Tests & Validation

- [ ] Tester l'inscription / connexion sur STG
- [ ] Tester le flow complet : créer équipe → inviter → créer projet → gérer tâches → upload fichier
- [ ] Tester l'espace admin (connexion, dashboard stats, liste utilisateurs, liste backups)
- [ ] Tester le cron de backup (lancer en local, vérifier le fichier dans S3 et l'entrée en BDD)
- [ ] Tester sur PRD après déploiement final
- [ ] Vérifier les CORS (pas d'erreurs cross-origin)
- [ ] Vérifier le routing SPA (refresh sur une page ne donne pas de 404)
- [ ] Vérifier les remontées de logs dans CloudWatch

---

## Présentation (vendredi) — par groupe de 3

### Élève 1

1. Supprimer et re-build le dev container (Docker)
2. Lancer l'API en local (+ montrer que ça marche avec Postman)
3. Lancer le script de migrations (`infrastructure/scripts/migrate.sh`)
4. Lancer le script de deploy API (`infrastructure/scripts/deploy-api.sh`)
5. Expliquer le système d'authentification (Better-auth — JWT, sessions, OAuth)
6. - Questions

### Élève 2

1. Montrer que le site user est en ligne (STG + PRD)
2. Montrer la feature des invitations (inviter par email, accepter/refuser)
3. Montrer la feature des pièces jointes (upload/consultation/suppression)
4. Lancer le script deploy assets (`infrastructure/scripts/deploy-assets.sh`)
5. Lancer le script deploy front (`infrastructure/scripts/deploy-web.sh`)
6. - Questions

### Élève 3

1. Montrer que le site admin est en ligne (STG + PRD)
2. Montrer que les backups marchent (lancer le cron en local)
3. Lancer le script deploy crons (`infrastructure/scripts/deploy-crons.sh`)
4. Montrer la CI/CD avec un push (GitHub Actions pipeline)
5. Montrer la gestion des environnements (STG/PRD)
6. Montrer les remontées de logs dans CloudWatch
7. - Questions

---

## Schéma d'architecture

> Utiliser draw.io pour schématiser :

- [ ] Infrastructure AWS complète (tous les services)
- [ ] Pipeline CI/CD (lint → build → deploy)
- [ ] Flux de données (user → CloudFront → API Gateway → Lambda → RDS)
- [ ] Flux des backups (EventBridge → Lambda Cron → RDS dump → S3)

---

## Rendu — À déposer sur DVL

- [ ] Noms des membres du groupe
- [ ] Lien du repository public sur **GitLab**
- [ ] URLs CloudFront Front User (STG et PRD)
- [ ] URLs CloudFront Front Admin (STG et PRD)
- [ ] Screenshots AWS pour tous les services utilisés :
  - RDS, Lambda, API Gateway, S3, CloudFront, EventBridge, CloudWatch, IAM, VPC, Secrets Manager, (SES si implémenté)

---

## Post-rendu (1 semaine après) — SUPPRESSION AWS

> **ATTENTION** : Supprimer tous les services AWS dans la semaine suivant le rendu pour éviter la facturation.

- [ ] Dresser la liste de tous les services AWS actifs :
  - [ ] RDS instances (STG + PRD)
  - [ ] Lambda functions (API STG/PRD + Cron STG/PRD + éventuellement Migration)
  - [ ] API Gateway APIs (STG + PRD)
  - [ ] S3 buckets (web, admin, assets, www-assets — STG + PRD)
  - [ ] CloudFront distributions (web, admin, API — STG + PRD)
  - [ ] EventBridge rules (backup hourly STG + PRD)
  - [ ] IAM roles et policies
  - [ ] Security groups
  - [ ] VPC, subnets, NAT Gateway, Internet Gateway
  - [ ] Secrets Manager secrets
  - [ ] ACM certificates
  - [ ] Route 53 records (si domaine acheté)
  - [ ] SES (si implémenté)
  - [ ] CloudWatch log groups
- [ ] Supprimer tous les services AWS
- [ ] Vérifier qu'aucune facturation résiduelle ne tourne
