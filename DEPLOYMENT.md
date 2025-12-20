# 🚀 Déploiement Fox Club sur Vercel

Guide complet pour déployer Fox Club avec base de données PostgreSQL et intégration continue.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration de la base de données](#configuration-de-la-base-de-données)
3. [Configuration Vercel](#configuration-vercel)
4. [Variables d'environnement](#variables-denvironnement)
5. [Scripts de déploiement](#scripts-de-déploiement)
6. [Intégration continue (CI/CD)](#intégration-continue-cicd)
7. [Post-déploiement](#post-déploiement)

---

## Prérequis

- Compte [Vercel](https://vercel.com)
- Compte [Neon](https://neon.tech) (base de données PostgreSQL gratuite) **OU** [Vercel Postgres](https://vercel.com/storage/postgres)
- Repository GitHub avec Fox Club
- Node.js 18+ installé localement

---

## Configuration de la base de données

### Option 1 : Neon (Recommandé - Gratuit avec pooling)

1. **Créer un compte sur [Neon](https://neon.tech)**

2. **Créer un nouveau projet** :
   - Nom : `foxclub`
   - Région : Choisir la plus proche de vos utilisateurs
   - PostgreSQL version : 15+

3. **Récupérer les URLs de connexion** :

   ```
   DATABASE_URL (pooled) : postgresql://user:pass@hostname/dbname?sslmode=require
   DIRECT_URL (non-pooled) : postgresql://user:pass@hostname/dbname?sslmode=require
   ```

4. **Noter les deux URLs** - vous en aurez besoin pour Vercel

### Option 2 : Vercel Postgres

1. Dans votre projet Vercel → **Storage** → **Create Database**
2. Choisir **Postgres**
3. Vercel créera automatiquement les variables d'environnement

---

## Configuration Vercel

### 1. Installer Vercel CLI (optionnel mais recommandé)

```bash
npm i -g vercel
vercel login
```

### 2. Créer le projet sur Vercel

**Via CLI :**

```bash
cd /home/user/foxclub
vercel
```

**Via l'interface web :**

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer votre repository GitHub `jgvalence/foxclub`
3. Configurer le projet :
   - **Framework Preset** : Next.js
   - **Root Directory** : `./`
   - **Build Command** : `npm run build` (automatique)
   - **Output Directory** : `.next` (automatique)

### 3. Configurer les variables d'environnement

Dans **Project Settings → Environment Variables**, ajouter :

#### Production

```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@hostname/foxclub?sslmode=require
DIRECT_URL=postgresql://user:pass@hostname/foxclub?sslmode=require

# NextAuth
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=https://votre-app.vercel.app

# Node Environment
NODE_ENV=production
```

#### Preview (optionnel - pour les branches de dev)

```env
DATABASE_URL=postgresql://...preview-db...
DIRECT_URL=postgresql://...preview-db...
NEXTAUTH_SECRET=same_as_production
NEXTAUTH_URL=https://foxclub-git-branch-name.vercel.app
NODE_ENV=production
```

**⚠️ Important** : Générer un secret sécurisé pour `NEXTAUTH_SECRET` :

```bash
openssl rand -base64 32
```

---

## Scripts de déploiement

### 1. Ajouter le script de build pour Vercel

Le fichier `package.json` doit contenir :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "postinstall": "prisma generate"
  }
}
```

**Explication** :

- `prisma generate` : Génère le client Prisma
- `prisma migrate deploy` : Applique les migrations en production
- `next build` : Build Next.js
- `postinstall` : Assure que Prisma est généré après `npm install`

### 2. Créer le fichier de configuration Vercel

Créer `vercel.json` à la racine :

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "DIRECT_URL": "@direct_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  }
}
```

**Note** : `cdg1` = Paris. Voir [liste des régions Vercel](https://vercel.com/docs/concepts/edge-network/regions).

---

## Intégration continue (CI/CD)

### Configuration GitHub → Vercel (Automatique)

Quand vous connectez votre repo GitHub à Vercel, le CI/CD est **automatique** :

1. **Push sur `main`** → Déploiement en **production**
2. **Push sur autre branch** → Déploiement en **preview**
3. **Pull Request** → Preview deployment avec URL unique

### Workflow automatique

```
┌─────────────────┐
│  git push main  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Vercel détecte     │
│  le changement      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  npm install        │
│  prisma generate    │
│  prisma migrate     │
│  npm run build      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Déploiement live   │
│  foxclub.vercel.app │
└─────────────────────┘
```

### Désactiver les preview deployments (optionnel)

Si vous voulez **désactiver** les déploiements automatiques sur les branches :

1. **Project Settings** → **Git**
2. Décocher **"Automatically create Preview Deployments"**

### GitHub Actions (optionnel - pour tests avant déploiement)

Créer `.github/workflows/ci.yml` :

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          DATABASE_URL: postgresql://fake:fake@localhost:5432/test
          DIRECT_URL: postgresql://fake:fake@localhost:5432/test
          NEXTAUTH_SECRET: test-secret
          NEXTAUTH_URL: http://localhost:3000
```

---

## Post-déploiement

### 1. Appliquer les migrations et seed

**Via Vercel CLI** (recommandé) :

```bash
# Se connecter à la production
vercel env pull .env.production

# Appliquer les migrations
npx prisma migrate deploy

# Seed de la base de données
npx prisma db seed
```

**Via l'interface Vercel** (one-time script) :

Créer un fichier `scripts/setup-production.ts` :

```typescript
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function setupProduction() {
  console.log("🦊 Setting up production database...");

  // Créer l'admin principal
  const adminPassword = await hash(
    process.env.ADMIN_PASSWORD || "CHANGE_ME",
    12
  );

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@foxclub.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@foxclub.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      approved: true,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Production setup complete!");
}

setupProduction()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Puis l'exécuter une fois :

```bash
npx tsx scripts/setup-production.ts
```

### 2. Vérifier le déploiement

1. Aller sur `https://votre-app.vercel.app`
2. Tester la connexion : `admin@foxclub.com` / votre mot de passe
3. Vérifier les logs : **Vercel Dashboard** → **Deployments** → **Function Logs**

### 3. Configurer le domaine personnalisé (optionnel)

1. **Project Settings** → **Domains**
2. Ajouter votre domaine : `foxclub.com`
3. Configurer les DNS selon les instructions Vercel
4. Mettre à jour `NEXTAUTH_URL` vers `https://foxclub.com`

---

## 🔒 Checklist de sécurité

Avant de déployer en production :

- [ ] `NEXTAUTH_SECRET` généré avec `openssl rand -base64 32`
- [ ] Mot de passe admin changé (pas `admin123`)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] SSL/HTTPS activé (automatique avec Vercel)
- [ ] Connexions base de données en SSL (`?sslmode=require`)
- [ ] `.env` ajouté au `.gitignore`
- [ ] Pas de secrets dans le code source
- [ ] Sentry ou monitoring activé (optionnel)

---

## 📊 Monitoring et logs

### Logs Vercel

**Dashboard** → **Deployments** → Cliquer sur un déploiement → **Function Logs**

Voir :

- Erreurs runtime
- Logs API routes
- Performance

### Monitoring base de données

**Neon Dashboard** :

- Connexions actives
- Requêtes lentes
- Utilisation du stockage

---

## 🛠️ Commandes utiles

```bash
# Pull des variables d'environnement de prod
vercel env pull .env.production

# Déployer manuellement
vercel --prod

# Voir les logs en temps réel
vercel logs

# Lister les déploiements
vercel ls

# Promouvoir un preview en production
vercel promote <deployment-url>

# Rollback à un déploiement précédent
vercel rollback
```

---

## 🚨 Troubleshooting

### Erreur : "Prisma Client not found"

**Solution** : Ajouter `postinstall` script :

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Erreur : "Can't reach database"

**Solutions** :

1. Vérifier que `DATABASE_URL` est correct dans Vercel
2. Vérifier que le SSL est activé (`?sslmode=require`)
3. Tester la connexion localement :
   ```bash
   npx prisma db pull
   ```

### Build timeout

**Solution** : Augmenter le timeout dans `vercel.json` :

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### Migrations ne s'appliquent pas

**Solution** : Exécuter manuellement :

```bash
vercel env pull
npx prisma migrate deploy
```

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

---

## ✅ Résumé : Déploiement en 5 minutes

```bash
# 1. Créer la base de données sur Neon
# 2. Connecter le repo GitHub à Vercel
# 3. Configurer les variables d'environnement
# 4. Push le code
git push origin main

# 5. Attendre le build automatique
# 6. Appliquer les migrations
vercel env pull
npx prisma migrate deploy
npx prisma db seed

# 7. Tester l'app !
test change deploy
```

Votre Fox Club est maintenant **live** ! 🦊🎉
