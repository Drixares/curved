# Guide de Configuration AWS - Projet Curved

> **Adaptations par rapport au cahier des charges :**
>
> - **GitHub Actions** au lieu de GitLab CI/CD
> - **better-auth** au lieu d'Amazon Cognito (l'auth est geree cote API)
> - **SES** sera fait sur une branche separee (etapes incluses quand meme)

---

## Table des matieres

- [0. Prerequisites et Conventions](#0-prerequisites-et-conventions)
- [1. IAM - Utilisateur et Roles](#1-iam---utilisateur-et-roles)
- [2. VPC et Reseau](#2-vpc-et-reseau)
- [3. RDS - PostgreSQL](#3-rds---postgresql)
- [4. S3 - Creation des 8 Buckets](#4-s3---creation-des-8-buckets)
- [5. CloudFront - Distributions](#5-cloudfront---distributions)
- [6. Lambda - Fonctions](#6-lambda---fonctions)
- [7. API Gateway](#7-api-gateway)
- [8. CloudWatch - Logs](#8-cloudwatch---logs)
- [9. EventBridge - Crons](#9-eventbridge---crons)
- [10. SES - Service d'Emails](#10-ses---service-demails)
- [11. GitHub Actions - CI/CD](#11-github-actions---cicd)
- [12. Recapitulatif des services a supprimer](#12-recapitulatif-des-services-a-supprimer)

---

## 0. Prerequisites et Conventions

### 0.1 Outils a installer en local

- [x] **AWS CLI v2** installe et configure

  ```bash
  # macOS
  brew install awscli

  # Verifier l'installation
  aws --version
  ```

- [x] **Configurer AWS CLI avec tes credentials**

  ```bash
  aws configure
  # AWS Access Key ID: <ta cle>
  # AWS Secret Access Key: <ton secret>
  # Default region name: eu-north-1  (Paris)
  # Default output format: json
  ```

- [x] **Configurer 2 profils** (staging et production)

  ```bash
  # Dans ~/.aws/credentials, ajouter :
  [curved-stg]
  aws_access_key_id = <CLE_STG>
  aws_secret_access_key = <SECRET_STG>

  [curved-prd]
  aws_access_key_id = <CLE_PRD>
  aws_secret_access_key = <SECRET_PRD>
  ```

### 0.2 Convention de nommage

| Ressource      | Pattern                               | Exemple STG              | Exemple PRD              |
| -------------- | ------------------------------------- | ------------------------ | ------------------------ |
| S3 Bucket      | `curved-{env}-{service}`              | `curved-stg-web`         | `curved-prd-web`         |
| CloudFront     | Description: `curved-{env}-{service}` | `curved-stg-web`         | `curved-prd-web`         |
| Lambda         | `curved-{env}-{service}`              | `curved-stg-api`         | `curved-prd-api`         |
| API Gateway    | `curved-{env}-api`                    | `curved-stg-api`         | `curved-prd-api`         |
| RDS            | `curved-{env}-db`                     | `curved-stg-db`          | `curved-prd-db`          |
| IAM Role       | `curved-{env}-{service}-role`         | `curved-stg-lambda-role` | `curved-prd-lambda-role` |
| Security Group | `curved-{env}-{service}-sg`           | `curved-stg-rds-sg`      | `curved-prd-rds-sg`      |

### 0.3 Region

Toutes les ressources seront creees dans **eu-north-1 (Paris)**.

---

## 1. IAM - Utilisateur et Roles

### 1.1 Creer un utilisateur IAM pour le projet

> Console AWS > IAM > Users

- [x] **Etape 1** : Aller dans IAM > Users > "Create user"
- [x] **Etape 2** : Nom : `curved-deployer`
- [x] **Etape 3** : Cocher "Provide user access to the AWS Management Console" (optionnel)
- [x] **Etape 4** : Choisir "Attach policies directly"
- [x] **Etape 5** : Attacher les policies suivantes :
  - `AmazonS3FullAccess`
  - `AmazonRDSFullAccess`
  - `AWSLambda_FullAccess`
  - `AmazonAPIGatewayAdministrator`
  - `CloudFrontFullAccess`
  - `AmazonSESFullAccess`
  - `CloudWatchLogsFullAccess`
  - `AmazonEventBridgeFullAccess`
  - `AmazonVPCFullAccess`
  - `IAMFullAccess` (pour creer les roles Lambda)
- [x] **Etape 6** : Creer l'utilisateur
- [x] **Etape 7** : Aller dans l'onglet "Security credentials" > "Create access key"
  - Use case : "Command Line Interface (CLI)"
  - Sauvegarder l'Access Key ID et le Secret Access Key

### 1.2 Creer le role IAM pour les fonctions Lambda

> Console AWS > IAM > Roles

#### Role pour l'API Lambda

- [x] **Etape 1** : IAM > Roles > "Create role"
- [x] **Etape 2** : Trusted entity type : "AWS service"
- [x] **Etape 3** : Use case : "Lambda"
- [x] **Etape 4** : Attacher les policies :
  - `AWSLambdaBasicExecutionRole` (logs CloudWatch)
  - `AmazonRDSDataFullAccess` (acces BDD)
  - `AmazonS3FullAccess` (acces aux buckets assets/backups)
  - `AmazonVPCCrossAccountNetworkInterfaceOperations` ou `AWSLambdaVPCAccessExecutionRole` (si Lambda dans VPC)
- [x] **Etape 5** : Nom du role : `curved-stg-lambda-role`
- [x] **Etape 6** : Creer le role
- [x] **Etape 7** : **Noter l'ARN** du role (ex: `arn:aws:iam::ACCOUNT_ID:role/curved-stg-lambda-role`)

- [x] **Repeter** pour `curved-prd-lambda-role`

#### Role pour le Cron Lambda

- [x] **Etape 1** : IAM > Roles > "Create role"
- [x] **Etape 2** : Trusted entity type : "AWS service" > Lambda
- [x] **Etape 3** : Attacher les policies :
  - `AWSLambdaBasicExecutionRole`
  - `AmazonRDSDataFullAccess`
  - `AmazonS3FullAccess` (pour ecrire les backups dans S3)
  - `AWSLambdaVPCAccessExecutionRole`
- [x] **Etape 4** : Nom : `curved-stg-cron-role`
- [x] **Etape 5** : Creer le role

- [x] **Repeter** pour `curved-prd-cron-role`

---

## 2. VPC et Reseau

> Le VPC est necessaire pour isoler la base RDS et permettre aux Lambdas d'y acceder.

### 2.1 Creer un VPC (ou utiliser le VPC par defaut)

> Console AWS > VPC > Your VPCs

**Option A : Utiliser le VPC par defaut** (plus simple)

- [x] Aller dans VPC > Your VPCs
- [x] Noter l'ID du VPC par defaut (ex: `vpc-xxxxxxxx`)
- [x] Noter les subnets disponibles (VPC > Subnets) — il en faut **au moins 2 dans des AZ differentes** pour RDS

**Option B : Creer un VPC dedie** (recommande pour la production)

- [x] VPC > "Create VPC"
- [x] Choisir "VPC and more" pour creer automatiquement les subnets
  - Name tag : `curved-vpc`
  - IPv4 CIDR : `10.0.0.0/16`
  - Number of AZs : 2
  - Number of public subnets : 2
  - Number of private subnets : 2
  - NAT gateways : "In 1 AZ" (necessaire pour que Lambda dans un subnet prive puisse acceder a Internet)
  - VPC endpoints : S3 Gateway (optionnel, optimise les acces S3)
- [x] "Create VPC"

### 2.2 Creer les Security Groups

> Console AWS > VPC > Security Groups

#### Security Group pour RDS

- [x] "Create security group"
  - Name : `curved-stg-rds-sg`
  - Description : "Allows PostgreSQL access from Lambda"
  - VPC : selectionner ton VPC
- [x] Inbound rules :
  - Type : `PostgreSQL`
  - Port : `5432`
  - Source : `Custom` > selectionner le Security Group de Lambda (on le creera juste apres, ou mettre le CIDR du VPC temporairement : `10.0.0.0/16`)
- [x] Outbound rules : laisser par defaut (All traffic)
- [x] "Create security group"
- [x] **Noter l'ID** du security group

- [x] **Repeter** pour `curved-prd-rds-sg`

#### Security Group pour Lambda

- [x] "Create security group"
  - Name : `curved-stg-lambda-sg`
  - Description : "Security group for Lambda functions"
  - VPC : selectionner ton VPC
- [x] Inbound rules : aucune (Lambda est invoquee par API Gateway, pas par le reseau)
- [x] Outbound rules : laisser par defaut (All traffic — pour acceder a RDS, S3, Internet)
- [x] "Create security group"

- [x] **Repeter** pour `curved-prd-lambda-sg`

#### Mise a jour du SG RDS

- [x] Retourner dans `curved-stg-rds-sg`
- [x] Modifier les Inbound rules > Source : selectionner `curved-stg-lambda-sg`
- [x] Sauvegarder

- [x] **Repeter** pour PRD

### 2.3 Creer un Subnet Group pour RDS

> Console AWS > RDS > Subnet groups

- [x] "Create DB subnet group"
  - Name : `curved-stg-db-subnet-group`
  - Description : "Subnets for curved staging RDS"
  - VPC : selectionner ton VPC
  - Availability Zones : selectionner au moins 2 AZ (ex: `eu-north-1a`, `eu-north-1b`)
  - Subnets : selectionner les **subnets prives** dans ces AZ
- [x] "Create"

- [x] **Repeter** pour `curved-prd-db-subnet-group`

---

## 3. RDS - PostgreSQL

> Console AWS > RDS > Databases

### 3.1 Creer l'instance Staging

- [x] **Etape 1** : RDS > "Create database"
- [x] **Etape 2** : Methode : "Standard create"
- [x] **Etape 3** : Engine type : **PostgreSQL**
- [x] **Etape 4** : Engine version : choisir la derniere version stable (ex: PostgreSQL 16.x)
- [x] **Etape 5** : Templates : **"Free tier"** (pour staging)
- [x] **Etape 6** : Settings :
  - DB instance identifier : `curved-stg-db`
  - Master username : `curved_admin`
  - Master password : **generer et sauvegarder un mot de passe fort**
- [x] **Etape 7** : Instance configuration :
  - DB instance class : `db.t3.micro` (Free tier) ou `db.t4g.micro`
- [x] **Etape 8** : Storage :
  - Storage type : `gp3`
  - Allocated storage : `20 Go` (minimum)
  - Desactiver "Storage autoscaling" pour eviter les couts
- [x] **Etape 9** : Connectivity :
  - VPC : selectionner ton VPC
  - DB Subnet group : `curved-stg-db-subnet-group`
  - Public access : **No** (la BDD ne doit pas etre accessible publiquement)
  - VPC security group : selectionner `curved-stg-rds-sg`
  - Availability Zone : pas de preference
  - Port : `5432`
- [x] **Etape 10** : Database authentication : "Password authentication"
- [x] **Etape 11** : Additional configuration :
  - Initial database name : `curved_stg`
  - Desactiver "Enable automated backups" pour staging (economie de couts)
  - Desactiver "Enable Enhanced monitoring" pour staging
  - Desactiver "Enable deletion protection" (pour pouvoir supprimer facilement apres le projet)
- [x] **Etape 12** : "Create database"
- [x] **Etape 13** : Attendre que le statut passe a "Available" (5-10 min)
- [x] **Etape 14** : **Noter l'endpoint** (ex: `curved-stg-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com`)

### 3.2 Creer l'instance Production

- [x] **Repeter les memes etapes** avec les modifications suivantes :
  - DB instance identifier : `curved-prd-db`
  - Initial database name : `curved_prd`
  - DB Subnet group : `curved-prd-db-subnet-group`
  - Security group : `curved-prd-rds-sg`
  - Activer "Enable automated backups" (retention 7 jours)
  - Activer "Enable deletion protection" (securite)

### 3.3 Tester la connexion (optionnel, via un bastion ou Lambda de test)

```bash
# Si tu as un bastion ou si tu as active "Public access" temporairement :
psql -h curved-stg-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com -U curved_admin -d curved_stg
```

### 3.4 Informations a sauvegarder

| Env | Endpoint                                                  | Port   | Database     | Username       |
| --- | --------------------------------------------------------- | ------ | ------------ | -------------- |
| STG | `curved-stg-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com` | `5432` | `curved_stg` | `curved_admin` |
| PRD | `curved-prd-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com` | `5432` | `curved_prd` | `curved_admin` |

---

## 4. S3 - Creation des 8 Buckets

> Console AWS > S3 > Buckets

### Vue d'ensemble des 8 buckets

| #   | Nom du Bucket        | Environnement | Usage                                     | Acces public ?                          |
| --- | -------------------- | ------------- | ----------------------------------------- | --------------------------------------- |
| 1   | `curved-stg-web`     | Staging       | Hebergement frontend utilisateur (SPA)    | Non (via CloudFront)                    |
| 2   | `curved-stg-admin`   | Staging       | Hebergement frontend admin (SPA)          | Non (via CloudFront)                    |
| 3   | `curved-stg-assets`  | Staging       | Fichiers uploades (pieces jointes taches) | Non (via CloudFront ou pre-signed URLs) |
| 4   | `curved-stg-backups` | Staging       | Backups BDD (cron)                        | Non                                     |
| 5   | `curved-prd-web`     | Production    | Hebergement frontend utilisateur (SPA)    | Non (via CloudFront)                    |
| 6   | `curved-prd-admin`   | Production    | Hebergement frontend admin (SPA)          | Non (via CloudFront)                    |
| 7   | `curved-prd-assets`  | Production    | Fichiers uploades (pieces jointes taches) | Non (via CloudFront ou pre-signed URLs) |
| 8   | `curved-prd-backups` | Production    | Backups BDD (cron)                        | Non                                     |

> **Note :** Les noms de buckets S3 sont **globalement uniques**. Si `curved-stg-web` est deja pris, ajoute un suffixe (ex: `curved-stg-web-123`).

### 4.1 Creer le bucket `curved-stg-web` (Frontend User - Staging)

- [x] **Etape 1** : S3 > "Create bucket"
- [x] **Etape 2** : Bucket name : `curved-stg-web`
- [x] **Etape 3** : AWS Region : `eu-north-1`
- [x] **Etape 4** : Object Ownership : "ACLs disabled"
- [x] **Etape 5** : Block Public Access : **Laisser tout coche** (on passe par CloudFront)
- [x] **Etape 6** : Bucket Versioning : Disable
- [x] **Etape 7** : Encryption : SSE-S3 (par defaut)
- [x] **Etape 8** : "Create bucket"

### 4.2 Creer le bucket `curved-stg-admin` (Frontend Admin - Staging)

- [x] Meme procedure que 4.1
- [x] Bucket name : `curved-stg-admin`

### 4.3 Creer le bucket `curved-stg-assets` (Assets - Staging)

- [x] Meme procedure que 4.1
- [x] Bucket name : `curved-stg-assets`
- [x] **Difference** : Activer CORS apres creation (pour les uploads depuis le frontend)

#### Configurer CORS sur le bucket assets

- [x] Aller dans le bucket `curved-stg-assets` > onglet "Permissions"
- [x] Scroll jusqu'a "Cross-origin resource sharing (CORS)" > "Edit"
- [x] Coller cette configuration :
  ```json
  [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
  ```
  > En production, remplacer `"*"` dans AllowedOrigins par l'URL CloudFront exacte.
- [x] "Save changes"

### 4.4 Creer le bucket `curved-stg-backups` (Backups BDD - Staging)

- [x] Meme procedure que 4.1
- [x] Bucket name : `curved-stg-backups`
- [x] Configurer une **Lifecycle rule** pour supprimer les anciens backups automatiquement :
  - Bucket > Management > "Create lifecycle rule"
  - Rule name : `delete-old-backups`
  - Apply to all objects
  - Expiration : "Expire current versions of objects" > 30 jours (ou selon besoin)

### 4.5 a 4.8 : Repeter pour Production

- [x] `curved-prd-web` — meme config que `curved-stg-web`
- [x] `curved-prd-admin` — meme config que `curved-stg-admin`
- [x] `curved-prd-assets` — meme config que `curved-stg-assets` (avec CORS, mais `AllowedOrigins` = URL de prod)
- [x] `curved-prd-backups` — meme config que `curved-stg-backups`

### Verification via CLI

```bash
# Lister tous les buckets pour verifier
aws s3 ls --profile curved-stg

# Verifier qu'un bucket est accessible
aws s3 ls s3://curved-stg-web --profile curved-stg
```

---

## 5. CloudFront - Distributions

> Console AWS > CloudFront > Distributions

Tu auras besoin de **4 distributions CloudFront** (minimum) pour servir les frontends :

| #   | Distribution       | Origin (S3 Bucket) | Usage                     |
| --- | ------------------ | ------------------ | ------------------------- |
| 1   | `curved-stg-web`   | `curved-stg-web`   | Frontend User Staging     |
| 2   | `curved-stg-admin` | `curved-stg-admin` | Frontend Admin Staging    |
| 3   | `curved-prd-web`   | `curved-prd-web`   | Frontend User Production  |
| 4   | `curved-prd-admin` | `curved-prd-admin` | Frontend Admin Production |

### 5.1 Creer la distribution `curved-stg-web`

#### Etape A : Creer un Origin Access Control (OAC)

> L'OAC permet a CloudFront d'acceder au bucket S3 sans rendre le bucket public.

- [x] CloudFront > "Origin access" (menu gauche) > onglet "Control settings" > "Create control setting"
  - Name : `curved-stg-web-oac`
  - Signing behavior : "Sign requests (recommended)"
  - Origin type : "S3"
- [x] "Create"

#### Etape B : Creer la distribution

- [x] CloudFront > "Create distribution"
- [x] **Origin** :
  - Origin domain : selectionner `curved-stg-web.s3.eu-north-1.amazonaws.com`
  - Origin access : "Origin access control settings (recommended)"
  - Selectionner `curved-stg-web-oac`
  - (Un message apparaitra pour mettre a jour la bucket policy — on le fera apres)
- [x] **Default cache behavior** :
  - Viewer protocol policy : "Redirect HTTP to HTTPS"
  - Allowed HTTP methods : "GET, HEAD"
  - Cache policy : `CachingOptimized`
  - Origin request policy : aucune
  - Response headers policy : aucune (ou `SecurityHeadersPolicy`)
- [x] **Settings** :
  - Price class : "Use only North America and Europe" (pour reduire les couts)
  - Default root object : `index.html`
  - Description : `curved-stg-web`
- [x] "Create distribution"
- [x] **Attendre le deploiement** (5-15 min, statut "Deploying" → "Enabled")
- [x] **Noter le domain name** (ex: `d1234567890.cloudfront.net`)

#### Etape C : Configurer la gestion des erreurs SPA (IMPORTANT)

> Pour qu'une SPA React fonctionne avec le routing client-side, il faut rediriger les erreurs 403/404 vers index.html.

- [x] Aller dans la distribution > onglet "Error pages"
- [x] "Create custom error response" :
  - HTTP error code : `403` (Forbidden)
  - Customize error response : Yes
  - Response page path : `/index.html`
  - HTTP response code : `200`
- [x] "Create custom error response" (encore) :
  - HTTP error code : `404` (Not Found)
  - Customize error response : Yes
  - Response page path : `/index.html`
  - HTTP response code : `200`

#### Etape D : Mettre a jour la Bucket Policy S3

> CloudFront te donne la policy a copier. Sinon, utilise ce modele :

- [x] Aller dans S3 > `curved-stg-web` > Permissions > Bucket policy > "Edit"
- [x] Coller :
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowCloudFrontServicePrincipal",
        "Effect": "Allow",
        "Principal": {
          "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::curved-stg-web/*",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
          }
        }
      }
    ]
  }
  ```
  > **Remplacer** `ACCOUNT_ID` par ton ID de compte AWS et `DISTRIBUTION_ID` par l'ID de ta distribution CloudFront.
- [x] "Save changes"

### 5.2 Creer la distribution `curved-stg-admin`

- [x] **Repeter exactement les etapes 5.1** (A, B, C, D) avec :
  - OAC : `curved-stg-admin-oac`
  - Origin : `curved-stg-admin.s3.eu-north-1.amazonaws.com`
  - Description : `curved-stg-admin`
  - Bucket policy sur `curved-stg-admin`

### 5.3 Creer la distribution `curved-prd-web`

- [x] **Repeter exactement les etapes 5.1** (A, B, C, D) avec :
  - OAC : `curved-prd-web-oac`
  - Origin : `curved-prd-web.s3.eu-north-1.amazonaws.com`
  - Description : `curved-prd-web`
  - Bucket policy sur `curved-prd-web`

### 5.4 Creer la distribution `curved-prd-admin`

- [x] **Repeter exactement les etapes 5.1** (A, B, C, D) avec :
  - OAC : `curved-prd-admin-oac`
  - Origin : `curved-prd-admin.s3.eu-north-1.amazonaws.com`
  - Description : `curved-prd-admin`
  - Bucket policy sur `curved-prd-admin`

### 5.5 (Optionnel) Distribution pour les assets

> Si tu veux servir les fichiers uploades via CloudFront (meilleure perf/securite) plutot que via des pre-signed URLs S3.

#### 5.5.1 Creer la distribution `curved-stg-assets`

##### Etape A : Creer un OAC

- [x] CloudFront > "Origin access" (menu gauche) > "Create control setting"
  - Name : `curved-stg-assets-oac`
  - Signing behavior : "Sign requests (recommended)"
  - Origin type : "S3"
- [x] "Create"

##### Etape B : Creer la distribution

- [x] CloudFront > "Create distribution"
- [x] **Origin** :
  - Origin domain : selectionner `curved-stg-assets.s3.eu-north-1.amazonaws.com`
  - Origin access : "Origin access control settings (recommended)"
  - Selectionner `curved-stg-assets-oac`
- [x] **Default cache behavior** :
  - Viewer protocol policy : "Redirect HTTP to HTTPS"
  - Allowed HTTP methods : "GET, HEAD"
  - Cache policy : `CachingOptimized`
- [x] **Settings** :
  - Price class : "Use only North America and Europe"
  - Default root object : laisser vide (ce ne sont pas des SPAs)
  - Description : `curved-stg-assets`
- [x] "Create distribution"
- [x] **Ne PAS** configurer les custom error responses (ce ne sont pas des SPAs)

##### Etape C : Mettre a jour la Bucket Policy S3

- [x] Aller dans S3 > `curved-stg-assets` > Permissions > Bucket policy > "Edit"
- [x] Coller :
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "AllowCloudFrontServicePrincipal",
        "Effect": "Allow",
        "Principal": {
          "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::curved-stg-assets/*",
        "Condition": {
          "StringEquals": {
            "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
          }
        }
      }
    ]
  }
  ```
  > **Remplacer** `ACCOUNT_ID` et `DISTRIBUTION_ID` par tes valeurs.
- [x] "Save changes"

#### 5.5.2 Creer la distribution `curved-prd-assets`

- [x] **Repeter exactement les etapes 5.5.1** (A, B, C) avec :
  - OAC : `curved-prd-assets-oac`
  - Origin : `curved-prd-assets.s3.eu-north-1.amazonaws.com`
  - Description : `curved-prd-assets`
  - Bucket policy sur `curved-prd-assets`

### Verification

```bash
# Tester que la distribution fonctionne (apres avoir uploade un index.html de test)
echo "<h1>Test</h1>" > /tmp/index.html
aws s3 cp /tmp/index.html s3://curved-stg-web/index.html --profile curved-stg

# Ouvrir dans le navigateur : https://d1234567890.cloudfront.net
```

### Tableau recapitulatif CloudFront

| Distribution       | Domain CloudFront         | Origin S3          | Statut |
| ------------------ | ------------------------- | ------------------ | ------ |
| `curved-stg-web`   | `dXXXXXXX.cloudfront.net` | `curved-stg-web`   | [ ]    |
| `curved-stg-admin` | `dXXXXXXX.cloudfront.net` | `curved-stg-admin` | [ ]    |
| `curved-prd-web`   | `dXXXXXXX.cloudfront.net` | `curved-prd-web`   | [ ]    |
| `curved-prd-admin` | `dXXXXXXX.cloudfront.net` | `curved-prd-admin` | [ ]    |

---

## 6. Lambda - Fonctions

> Console AWS > Lambda > Functions

Tu as besoin de **4 fonctions Lambda** :

| #   | Nom               | Runtime  | Usage                        |
| --- | ----------------- | -------- | ---------------------------- |
| 1   | `curved-stg-api`  | Bun/Node | API Hono - Staging           |
| 2   | `curved-prd-api`  | Bun/Node | API Hono - Production        |
| 3   | `curved-stg-cron` | Bun/Node | Cron backup BDD - Staging    |
| 4   | `curved-prd-cron` | Bun/Node | Cron backup BDD - Production |

### 6.1 Creer la Lambda `curved-stg-api`

- [x] **Etape 1** : Lambda > "Create function"
- [x] **Etape 2** : "Author from scratch"
- [x] **Etape 3** : Function name : `curved-stg-api`
- [x] **Etape 4** : Runtime : `Node.js 20.x`
  > Hono avec Bun se build en un bundle compatible Node.js pour Lambda.
  > Si tu utilises un custom runtime Bun, choisir "Custom runtime on Amazon Linux 2023" et ajouter un Lambda Layer Bun.
- [x] **Etape 5** : Architecture : `arm64` (moins cher) ou `x86_64`
- [x] **Etape 6** : Execution role : "Use an existing role" > selectionner `curved-stg-lambda-role`
- [x] **Etape 7** : "Create function"

#### Configurer la Lambda

- [x] **Onglet "Configuration"** > "General configuration" > "Edit" :
  - Memory : `256 MB` (ajuster selon besoin, 128 MB minimum)
  - Timeout : `30 seconds` (API Gateway a un max de 29s)
  - Ephemeral storage : `512 MB` (par defaut)
- [x] **Onglet "Configuration"** > "Environment variables" > "Edit" :
  ```
  NODE_ENV          = staging
  DATABASE_HOST     = curved-stg-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com
  DATABASE_PORT     = 5432
  DATABASE_NAME     = curved_stg
  DATABASE_USER     = curved_admin
  DATABASE_PASSWORD = <MOT_DE_PASSE_STG>
  ASSETS_BUCKET     = curved-stg-assets
  JWT_SECRET        = <GENERER_UN_SECRET_FORT>
  CORS_ORIGINS      = https://dXXXXXXX.cloudfront.net,https://dYYYYYYY.cloudfront.net
  ```
  > `CORS_ORIGINS` (avec un **S**) : mettre les URLs CloudFront de `curved-stg-web` et `curved-stg-admin` separees par une virgule, sans espace.

#### Configurer le VPC (pour acceder a RDS)

- [x] **Onglet "Configuration"** > "VPC" > "Edit" :
  - VPC : selectionner ton VPC
  - Subnets : selectionner les **subnets prives** (meme AZ que RDS)
  - Security groups : selectionner `curved-stg-lambda-sg`
- [x] "Save"

#### Deployer le code (premiere fois, placeholder)

- [ ] Pour le moment, laisser le code par defaut (handler de test)
- [ ] Le vrai deploiement se fera via le script deploy ou GitHub Actions

### 6.2 Creer la Lambda `curved-prd-api`

- [x] **Repeter 6.1** avec :
  - Function name : `curved-prd-api`
  - Role : `curved-prd-lambda-role`
  - Variables d'environnement pointant vers les ressources PRD
  - VPC/Subnets/SG de PRD

### 6.3 Creer la Lambda `curved-stg-cron`

- [x] **Etape 1** : Lambda > "Create function"
- [x] **Etape 2** : Function name : `curved-stg-cron`
- [x] **Etape 3** : Runtime : `Node.js 20.x`
- [x] **Etape 4** : Role : `curved-stg-cron-role`
- [x] **Etape 5** : "Create function"

#### Configurer la Lambda Cron

- [x] **General configuration** :
  - Memory : `256 MB`
  - Timeout : `5 minutes` (le backup peut prendre du temps, max 15 min)
- [x] **Environment variables** :
  ```
  NODE_ENV          = staging
  DATABASE_HOST     = curved-stg-db.xxxxxxxxxxxx.eu-north-1.rds.amazonaws.com
  DATABASE_PORT     = 5432
  DATABASE_NAME     = curved_stg
  DATABASE_USER     = curved_admin
  DATABASE_PASSWORD = <MOT_DE_PASSE_STG>
  BACKUP_BUCKET     = curved-stg-backups
  ```
- [x] **VPC** : meme config que la Lambda API (pour acceder a RDS)

### 6.4 Creer la Lambda `curved-prd-cron`

- [x] **Repeter 6.3** avec les ressources PRD

---

## 7. API Gateway

> Console AWS > API Gateway

### 7.1 Creer l'API Gateway Staging

- [x] **Etape 1** : API Gateway > "Create API"
- [x] **Etape 2** : Choisir **"HTTP API"** > "Build"
  > HTTP API est plus simple et moins cher que REST API. Suffisant pour ce projet.
- [x] **Etape 3** : Integrations :
  - "Add integration"
  - Integration type : "Lambda"
  - AWS Region : `eu-north-1`
  - Lambda function : `curved-stg-api`
  - Version : `2.0`
- [x] **Etape 4** : API name : `curved-stg-api`
- [x] **Etape 5** : Routes :
  - Methode : `ANY`
  - Resource path : `/{proxy+}`
  - Integration target : `curved-stg-api` (Lambda)
    > Cela redirige TOUTES les requetes vers ta Lambda Hono qui gere le routing.
- [x] **Etape 6** : Stages :
  - Stage name : `$default`
  - Auto-deploy : activer
- [x] **Etape 7** : "Create"
- [x] **Etape 8** : **Noter l'URL de l'API** (ex: `https://xxxxxxxxxx.execute-api.eu-north-1.amazonaws.com`)

#### CORS

> **Pas besoin de configurer le CORS dans API Gateway.** Le CORS est deja gere par le middleware Hono dans `app.ts` via la variable d'environnement `CORS_ORIGINS` de la Lambda. Configurer le CORS aux deux endroits peut provoquer des conflits (double headers).

### 7.2 Creer l'API Gateway Production

- [x] **Repeter 7.1** avec :
  - Lambda function : `curved-prd-api`
  - API name : `curved-prd-api`

### Tableau recapitulatif API Gateway

| API Gateway      | URL                                                       | Lambda connectee | Statut |
| ---------------- | --------------------------------------------------------- | ---------------- | ------ |
| `curved-stg-api` | `https://xxxxxxxxxx.execute-api.eu-north-1.amazonaws.com` | `curved-stg-api` | [ ]    |
| `curved-prd-api` | `https://xxxxxxxxxx.execute-api.eu-north-1.amazonaws.com` | `curved-prd-api` | [ ]    |

---

## 8. CloudWatch - Logs

> Les logs sont automatiquement crees quand une Lambda s'execute, grace au role `AWSLambdaBasicExecutionRole`.

### 8.1 Verifier que les Log Groups existent

> Console AWS > CloudWatch > Log groups

Apres la premiere execution de chaque Lambda, tu verras ces log groups :

- [ ] `/aws/lambda/curved-stg-api`
- [ ] `/aws/lambda/curved-prd-api`
- [ ] `/aws/lambda/curved-stg-cron`
- [ ] `/aws/lambda/curved-prd-cron`

### 8.2 Configurer la retention des logs

- [ ] Pour chaque log group :
  - Cliquer sur le log group
  - Actions > "Edit retention setting"
  - Staging : `1 semaine` ou `1 mois`
  - Production : `1 mois` ou `3 mois`

### 8.3 Configurer les logs API Gateway (optionnel)

- [ ] API Gateway > ton API > "Monitor" > "Logging"
- [ ] Activer les access logs
- [ ] Format : JSON
- [ ] Destination : creer un nouveau log group `/aws/apigateway/curved-stg-api`

---

## 9. EventBridge - Crons

> Console AWS > Amazon EventBridge > Rules

Le cron doit lancer un backup de la BDD toutes les heures.

### 9.1 Creer la regle cron Staging

- [x] **Etape 1** : EventBridge > "Rules" (menu gauche) > "Create rule"
- [x] **Etape 2** :
  - Name : `curved-stg-backup-cron`
  - Description : "Trigger DB backup every hour"
  - Event bus : "default"
- [x] **Etape 3** : Rule type : "Schedule"
- [x] **Etape 4** : Schedule pattern : "A schedule that runs at a regular rate"
  - Rate expression : `rate(1 hour)`
    > Ou en cron expression : `cron(0 * * * ? *)` (toutes les heures a la minute 0)
- [x] **Etape 5** : Target :
  - Target type : "AWS service"
  - Select target : "Lambda function"
  - Function : `curved-stg-cron`
- [x] **Etape 6** : "Create rule"

### 9.2 Creer la regle cron Production

- [x] **Repeter 9.1** avec :
  - Name : `curved-prd-backup-cron`
  - Function : `curved-prd-cron`

### 9.3 Verifier le fonctionnement

- [ ] Attendre 1 heure ou tester manuellement :
  - Lambda > `curved-stg-cron` > "Test"
  - Configurer un event de test vide : `{}`
  - "Test"
- [ ] Verifier dans CloudWatch Logs que le cron s'est execute
- [ ] Verifier dans S3 que le fichier de backup est present

---

## 10. SES - Service d'Emails

> Console AWS > Amazon SES
>
> **Note :** Cette partie sera faite sur une branche separee, mais voici toutes les etapes.

### 10.1 Verifier ton domaine ou email

> Par defaut, SES est en mode "sandbox" : tu ne peux envoyer qu'a des adresses verifiees.

#### Option A : Verifier une adresse email (rapide, pour le dev)

- [x] SES > "Verified identities" > "Create identity"
- [x] Identity type : "Email address"
- [x] Email : `ton-email@example.com`
- [x] "Create identity"
- [x] **Aller dans ta boite mail** et cliquer sur le lien de verification

#### Option B : Verifier un domaine (pour la production)

- [x] SES > "Verified identities" > "Create identity"
- [x] Identity type : "Domain"
- [x] Domain : `tondomaine.com`
- [x] "Create identity"
- [x] **Ajouter les enregistrements DNS** (DKIM) que SES te fournit dans ton registrar DNS :
  - 3 enregistrements CNAME pour DKIM
  - (Optionnel) 1 enregistrement TXT pour SPF
  - (Optionnel) 1 enregistrement TXT pour DMARC
- [x] Attendre la verification (peut prendre jusqu'a 72h, generalement quelques minutes)

### 10.2 Sortir du mode Sandbox (pour la production)

> En sandbox, tu ne peux envoyer qu'aux adresses verifiees. Pour envoyer a n'importe qui :

- [ ] SES > "Account dashboard"
- [ ] "Request production access"
- [ ] Remplir le formulaire :
  - Mail type : "Transactional"
  - Use case : expliquer que tu envoies des emails d'invitation a rejoindre une equipe
  - Website URL : ton URL CloudFront
- [ ] Soumettre et attendre l'approbation AWS (24-48h)

### 10.3 Creer les credentials SMTP (pour envoyer depuis l'API)

- [x] SES > "SMTP settings" (menu gauche)
- [x] "Create SMTP credentials"
- [x] IAM User Name : `curved-ses-smtp-user`
- [x] "Create user"
- [x] **Sauvegarder les credentials** :
  - SMTP Username
  - SMTP Password
- [x] **Noter le serveur SMTP** :
  - Server : `email-smtp.eu-north-1.amazonaws.com`
  - Port : `587` (TLS)

### 10.4 Alternative : Utiliser le SDK AWS directement

> Au lieu de SMTP, tu peux utiliser le SDK AWS dans ta Lambda pour envoyer des emails.

Variables d'environnement a ajouter dans la Lambda API :

```
SES_REGION        = eu-north-1
SES_FROM_EMAIL    = noreply@tondomaine.com
```

La Lambda a deja `AmazonSESFullAccess` via son role IAM, donc pas besoin de credentials SMTP.

### 10.5 Tester l'envoi d'email

```bash
# Via AWS CLI
aws ses send-email \
  --from "noreply@tondomaine.com" \
  --destination "ToAddresses=test@example.com" \
  --message "Subject={Data=Test},Body={Text={Data=Ceci est un test}}" \
  --region eu-north-1 \
  --profile curved-stg
```

---

## 11. GitHub Actions - CI/CD

> Au lieu de GitLab CI/CD mentionne dans le cahier des charges, on utilise GitHub Actions.

### 11.1 Configurer les secrets GitHub

> GitHub > Repository > Settings > Secrets and variables > Actions

- [x] Ajouter les secrets suivants :

| Secret Name                 | Valeur                          |
| --------------------------- | ------------------------------- |
| `AWS_ACCESS_KEY_ID_STG`     | Access Key du profil staging    |
| `AWS_SECRET_ACCESS_KEY_STG` | Secret Key du profil staging    |
| `AWS_ACCESS_KEY_ID_PRD`     | Access Key du profil production |
| `AWS_SECRET_ACCESS_KEY_PRD` | Secret Key du profil production |
| `AWS_REGION`                | `eu-north-1`                    |
| `DATABASE_PASSWORD_STG`     | Mot de passe RDS staging        |
| `DATABASE_PASSWORD_PRD`     | Mot de passe RDS production     |
| `JWT_SECRET_STG`            | Secret JWT staging              |
| `JWT_SECRET_PRD`            | Secret JWT production           |

### 11.2 Structure des workflows

Creer le dossier `.github/workflows/` avec les fichiers suivants :

#### `deploy-api.yml` - Deploy de l'API Lambda

```yaml
name: Deploy API

on:
  push:
    branches:
      - main # Production
      - staging # Staging
    paths:
      - 'code/api/**'
      - 'code/domain/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: cd code/api && bun install

      - name: Build
        run: cd code/api && bun run build

      - name: Set environment
        id: env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then
            echo "ENV=prd" >> $GITHUB_OUTPUT
            echo "AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID_PRD }}" >> $GITHUB_OUTPUT
            echo "AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY_PRD }}" >> $GITHUB_OUTPUT
          else
            echo "ENV=stg" >> $GITHUB_OUTPUT
            echo "AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID_STG }}" >> $GITHUB_OUTPUT
            echo "AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY_STG }}" >> $GITHUB_OUTPUT
          fi

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ steps.env.outputs.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ steps.env.outputs.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Deploy Lambda
        run: |
          cd code/api
          zip -r function.zip dist/
          aws lambda update-function-code \
            --function-name curved-${{ steps.env.outputs.ENV }}-api \
            --zip-file fileb://function.zip
```

#### `deploy-front.yml` - Deploy des frontends

```yaml
name: Deploy Frontend

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'code/www-user/**'
      - 'code/www-admin/**'

jobs:
  deploy-user:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.modified, 'code/www-user') || contains(github.event.head_commit.added, 'code/www-user')
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Build
        run: cd code/www-user && bun install && bun run build
      - name: Set env
        id: env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then echo "ENV=prd" >> $GITHUB_OUTPUT; else echo "ENV=stg" >> $GITHUB_OUTPUT; fi
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ github.ref == 'refs/heads/main' && secrets.AWS_ACCESS_KEY_ID_PRD || secrets.AWS_ACCESS_KEY_ID_STG }}
          aws-secret-access-key: ${{ github.ref == 'refs/heads/main' && secrets.AWS_SECRET_ACCESS_KEY_PRD || secrets.AWS_SECRET_ACCESS_KEY_STG }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Sync to S3
        run: aws s3 sync code/www-user/dist/ s3://curved-${{ steps.env.outputs.ENV }}-web --delete
      - name: Invalidate CloudFront cache
        run: |
          DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='curved-${{ steps.env.outputs.ENV }}-web'].Id" --output text)
          aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

  deploy-admin:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.modified, 'code/www-admin') || contains(github.event.head_commit.added, 'code/www-admin')
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Build
        run: cd code/www-admin && bun install && bun run build
      - name: Set env
        id: env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then echo "ENV=prd" >> $GITHUB_OUTPUT; else echo "ENV=stg" >> $GITHUB_OUTPUT; fi
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ github.ref == 'refs/heads/main' && secrets.AWS_ACCESS_KEY_ID_PRD || secrets.AWS_ACCESS_KEY_ID_STG }}
          aws-secret-access-key: ${{ github.ref == 'refs/heads/main' && secrets.AWS_SECRET_ACCESS_KEY_PRD || secrets.AWS_SECRET_ACCESS_KEY_STG }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Sync to S3
        run: aws s3 sync code/www-admin/dist/ s3://curved-${{ steps.env.outputs.ENV }}-admin --delete
      - name: Invalidate CloudFront cache
        run: |
          DISTRIBUTION_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='curved-${{ steps.env.outputs.ENV }}-admin'].Id" --output text)
          aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

#### `deploy-cron.yml` - Deploy du Cron Lambda

```yaml
name: Deploy Cron

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'code/crons/**'
      - 'code/domain/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Build
        run: cd code/crons && bun install && bun run build
      - name: Set env
        id: env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then echo "ENV=prd" >> $GITHUB_OUTPUT; else echo "ENV=stg" >> $GITHUB_OUTPUT; fi
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ github.ref == 'refs/heads/main' && secrets.AWS_ACCESS_KEY_ID_PRD || secrets.AWS_ACCESS_KEY_ID_STG }}
          aws-secret-access-key: ${{ github.ref == 'refs/heads/main' && secrets.AWS_SECRET_ACCESS_KEY_PRD || secrets.AWS_SECRET_ACCESS_KEY_STG }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Deploy
        run: |
          cd code/crons
          zip -r function.zip dist/
          aws lambda update-function-code \
            --function-name curved-${{ steps.env.outputs.ENV }}-cron \
            --zip-file fileb://function.zip
```

#### `deploy-assets.yml` - Deploy des assets statiques

```yaml
name: Deploy Assets

on:
  push:
    branches:
      - main
      - staging
    paths:
      - 'code/www-assets/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set env
        id: env
        run: |
          if [ "${{ github.ref }}" = "refs/heads/main" ]; then echo "ENV=prd" >> $GITHUB_OUTPUT; else echo "ENV=stg" >> $GITHUB_OUTPUT; fi
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ github.ref == 'refs/heads/main' && secrets.AWS_ACCESS_KEY_ID_PRD || secrets.AWS_ACCESS_KEY_ID_STG }}
          aws-secret-access-key: ${{ github.ref == 'refs/heads/main' && secrets.AWS_SECRET_ACCESS_KEY_PRD || secrets.AWS_SECRET_ACCESS_KEY_STG }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Sync assets to S3
        run: aws s3 sync code/www-assets/ s3://curved-${{ steps.env.outputs.ENV }}-assets --delete
```

#### `run-migrations.yml` - Executer les migrations BDD

```yaml
name: Run Migrations

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment (stg or prd)'
        required: true
        default: 'stg'
        type: choice
        options:
          - stg
          - prd

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ inputs.environment == 'prd' && secrets.AWS_ACCESS_KEY_ID_PRD || secrets.AWS_ACCESS_KEY_ID_STG }}
          aws-secret-access-key: ${{ inputs.environment == 'prd' && secrets.AWS_SECRET_ACCESS_KEY_PRD || secrets.AWS_SECRET_ACCESS_KEY_STG }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Run migrations
        run: |
          cd infrastructure/scripts
          bun run migrate.ts
        env:
          DATABASE_HOST: ${{ inputs.environment == 'prd' && secrets.DATABASE_HOST_PRD || secrets.DATABASE_HOST_STG }}
          DATABASE_PASSWORD: ${{ inputs.environment == 'prd' && secrets.DATABASE_PASSWORD_PRD || secrets.DATABASE_PASSWORD_STG }}
```

---

## 12. Recapitulatif des services a supprimer

> **ATTENTION** : A la fin du projet, supprimer **TOUS** les services AWS pour eviter les couts.
> Maintenir cette checklist a jour au fur et a mesure de la creation.

### S3 Buckets (8)

- [ ] `curved-stg-web` — Vider puis supprimer
- [ ] `curved-stg-admin` — Vider puis supprimer
- [ ] `curved-stg-assets` — Vider puis supprimer
- [ ] `curved-stg-backups` — Vider puis supprimer
- [ ] `curved-prd-web` — Vider puis supprimer
- [ ] `curved-prd-admin` — Vider puis supprimer
- [ ] `curved-prd-assets` — Vider puis supprimer
- [ ] `curved-prd-backups` — Vider puis supprimer

```bash
# Commande pour vider et supprimer un bucket
aws s3 rm s3://curved-stg-web --recursive --profile curved-stg
aws s3 rb s3://curved-stg-web --profile curved-stg
```

### CloudFront Distributions (4+)

- [ ] `curved-stg-web` — Desactiver puis supprimer
- [ ] `curved-stg-admin` — Desactiver puis supprimer
- [ ] `curved-prd-web` — Desactiver puis supprimer
- [ ] `curved-prd-admin` — Desactiver puis supprimer

> **Important** : Il faut d'abord **desactiver** la distribution, attendre qu'elle soit "Deployed", puis la supprimer.

### Lambda Functions (4)

- [ ] `curved-stg-api`
- [ ] `curved-prd-api`
- [ ] `curved-stg-cron`
- [ ] `curved-prd-cron`

### API Gateway (2)

- [ ] `curved-stg-api`
- [ ] `curved-prd-api`

### RDS Instances (2)

- [ ] `curved-stg-db` — Desactiver la protection de suppression si activee, puis supprimer (sans snapshot final pour staging)
- [ ] `curved-prd-db` — Desactiver la protection de suppression, puis supprimer

### EventBridge Rules (2)

- [ ] `curved-stg-backup-cron`
- [ ] `curved-prd-backup-cron`

### CloudWatch Log Groups (4+)

- [ ] `/aws/lambda/curved-stg-api`
- [ ] `/aws/lambda/curved-prd-api`
- [ ] `/aws/lambda/curved-stg-cron`
- [ ] `/aws/lambda/curved-prd-cron`
- [ ] `/aws/apigateway/curved-stg-api` (si cree)
- [ ] `/aws/apigateway/curved-prd-api` (si cree)

### IAM

- [ ] Role `curved-stg-lambda-role`
- [ ] Role `curved-prd-lambda-role`
- [ ] Role `curved-stg-cron-role`
- [ ] Role `curved-prd-cron-role`
- [ ] User `curved-deployer`
- [ ] User `curved-ses-smtp-user` (si cree)

### VPC (si cree dedie)

- [ ] NAT Gateway (attention, couteux si oublie !)
- [ ] Elastic IPs associees au NAT
- [ ] Security Groups (`curved-*-sg`)
- [ ] DB Subnet Groups
- [ ] VPC `curved-vpc`

### SES

- [ ] Identites verifiees (emails/domaines)
- [ ] SMTP credentials

### CloudFront OAC (Origin Access Control)

- [ ] `curved-stg-web-oac`
- [ ] `curved-stg-admin-oac`
- [ ] `curved-prd-web-oac`
- [ ] `curved-prd-admin-oac`

---

## Ordre recommande de creation

Voici l'ordre optimal pour tout creer sans blocages de dependances :

```
1.  IAM (utilisateur + roles)            → Section 1
2.  VPC + Security Groups + Subnets      → Section 2
3.  RDS PostgreSQL (stg + prd)           → Section 3
4.  S3 Buckets (les 8)                   → Section 4
5.  CloudFront (4 distributions)         → Section 5
6.  Lambda (4 fonctions)                 → Section 6
7.  API Gateway (2 APIs)                 → Section 7
8.  CloudWatch (verification)            → Section 8
9.  EventBridge (2 regles cron)          → Section 9
10. SES (branche separee)               → Section 10
11. GitHub Actions (CI/CD)               → Section 11
```

---

## Notes importantes

- **Couts** : Le VPC avec NAT Gateway coute ~$32/mois. Pour economiser en staging, tu peux mettre les Lambda hors VPC et rendre RDS public temporairement (moins securise).
- **Free Tier** : RDS `db.t3.micro` et Lambda (1M requetes/mois) sont dans le free tier AWS pendant 12 mois.
- **Regions** : Garde tout dans `eu-north-1` (Paris) pour minimiser la latence et simplifier la config.
- **Securite** : Ne jamais committer les credentials AWS, mots de passe BDD, ou JWT secrets dans le code. Toujours utiliser les variables d'environnement Lambda ou les secrets GitHub.
