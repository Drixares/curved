# Setup AWS OIDC pour GitHub Actions

Ce guide te permet de remplacer les clés statiques AWS (access key / secret key) par une authentification OIDC.
Avec OIDC, GitHub génère un token temporaire à chaque run — plus besoin de stocker des clés longue durée dans les secrets GitHub.

---

## 1. Créer le Identity Provider OIDC dans AWS

**C'est quoi ?**
Un Identity Provider (IdP) OIDC dit à AWS : "je fais confiance aux tokens émis par GitHub Actions".
C'est le lien de confiance entre GitHub et ton compte AWS. Tu ne le crées qu'une seule fois par compte AWS.

**Comment :**

1. Va dans **IAM → Identity providers → Add provider**
2. Remplis :
   - Provider type : **OpenID Connect**
   - Provider URL : `https://token.actions.githubusercontent.com`
   - Audience : `sts.amazonaws.com`
3. Clique **Add provider**

---

## 2. Créer les IAM Roles (un par environnement)

**C'est quoi ?**
Un IAM Role est une identité AWS avec des permissions attachées. Contrairement à un user avec des clés statiques, un role émet des credentials temporaires (15 min par défaut). Chaque workflow GitHub "assume" ce role le temps du job.

Tu vas créer 2 roles : un pour staging, un pour production.

### 2a. Role Staging : `github-deploy-stg`

1. Va dans **IAM → Roles → Create role**
2. Trusted entity type : **Web identity**
3. Identity provider : sélectionne `token.actions.githubusercontent.com`
4. Audience : `sts.amazonaws.com`
5. Clique **Next**, skip les policies pour l'instant, nomme le role `github-deploy-stg`
6. Après création, va dans l'onglet **Trust relationships → Edit trust policy** et remplace par :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<TON_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<TON_ORG>/curved:environment:staging"
        }
      }
    }
  ]
}
```

> **Pourquoi cette condition ?**
> Le champ `sub` restreint le role aux workflows qui tournent dans l'environment GitHub "staging" du repo `curved`. Même si quelqu'un fork ton repo, il ne pourra pas assumer ce role.

### 2b. Role Production : `github-deploy-prd`

Même procédure, mais avec :

- Nom : `github-deploy-prd`
- Trust policy : remplace `environment:staging` par `environment:production`

```json
"token.actions.githubusercontent.com:sub": "repo:<TON_ORG>/curved:environment:production"
```

---

## 3. Attacher les permissions aux roles

**C'est quoi ?**
Les permissions définissent ce que le role a le droit de faire dans AWS. On applique le principe du moindre privilège : chaque role ne peut faire que ce dont les workflows ont besoin.

Pour chaque role (`github-deploy-stg` et `github-deploy-prd`), va dans **Permissions → Add permissions → Create inline policy → JSON** et colle :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "LambdaDeploy",
      "Effect": "Allow",
      "Action": ["lambda:UpdateFunctionCode", "lambda:GetFunction"],
      "Resource": [
        "arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:curved-api-<ENV>",
        "arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:curved-cron-backup-<ENV>"
      ]
    },
    {
      "Sid": "S3Deploy",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::curved-web-<ENV>",
        "arn:aws:s3:::curved-web-<ENV>/*",
        "arn:aws:s3:::curved-admin-<ENV>",
        "arn:aws:s3:::curved-admin-<ENV>/*",
        "arn:aws:s3:::curved-www-assets-<ENV>",
        "arn:aws:s3:::curved-www-assets-<ENV>/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidation",
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": [
        "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<CF_DISTRIBUTION_WEB>",
        "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<CF_DISTRIBUTION_ADMIN>"
      ]
    },
    {
      "Sid": "SecretsManagerRead",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:<REGION>:<ACCOUNT_ID>:secret:curved/<ENV>-*"
    }
  ]
}
```

> Remplace `<ENV>` par `stg` ou `prd`, `<REGION>` par ta région (ex: `eu-west-1`), et `<ACCOUNT_ID>` par ton ID de compte AWS (12 chiffres).

---

## 4. Configurer les variables GitHub

**C'est quoi ?**
Les GitHub Environment Variables (`vars`) sont des valeurs non-secrètes accessibles dans les workflows. Tu vas y stocker l'ARN du role pour que chaque job sache quel role assumer.

1. Va dans **GitHub → Settings → Environments**
2. Pour l'environment **staging**, ajoute la variable :
   - `AWS_ROLE_ARN` = `arn:aws:iam::<ACCOUNT_ID>:role/github-deploy-stg`
3. Pour l'environment **production**, ajoute la variable :
   - `AWS_ROLE_ARN` = `arn:aws:iam::<ACCOUNT_ID>:role/github-deploy-prd`

---

## 5. Mettre à jour les workflows

Une fois les étapes 1-4 terminées, remplace dans chaque job de deploy (deploy-stg.yml et deploy-prd.yml) :

**Avant :**

```yaml
permissions:
  contents: read

# ...
- uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ vars.AWS_REGION }}
```

**Après :**

```yaml
permissions:
  id-token: write
  contents: read

# ...
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ vars.AWS_ROLE_ARN }}
    aws-region: ${{ vars.AWS_REGION }}
```

---

## 6. Supprimer les anciennes clés

Une fois que le premier deploy OIDC fonctionne en staging :

1. **Supprime les secrets GitHub** : `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY` dans les deux environments
2. **Désactive/supprime l'IAM User** qui détenait ces clés dans AWS (IAM → Users)

> Teste d'abord en staging avant de toucher à la production.

---

## Checklist

- [ ] Identity Provider OIDC créé dans AWS IAM
- [ ] Role `github-deploy-stg` créé avec trust policy + permissions
- [ ] Role `github-deploy-prd` créé avec trust policy + permissions
- [ ] `AWS_ROLE_ARN` ajouté dans l'environment GitHub "staging"
- [ ] `AWS_ROLE_ARN` ajouté dans l'environment GitHub "production"
- [ ] Workflows mis à jour (permissions + role-to-assume)
- [ ] Test deploy staging OK
- [ ] Test deploy production OK
- [ ] Anciennes clés AWS supprimées de GitHub
- [ ] Ancien IAM User supprimé/désactivé
