# 🚀 Déploiement Rapide sur Vercel

Guide en 5 minutes pour déployer Fox Club sur Vercel.

## ✅ Checklist Pré-Déploiement

- [ ] Compte Vercel créé
- [ ] Compte Neon créé (base de données)
- [ ] Repository GitHub à jour
- [ ] Fichiers modifiés :
  - [x] `package.json` - script build mis à jour
  - [x] `vercel.json` - configuration Vercel
  - [x] `.env.example` - variables d'environnement

---

## 📝 Étape 1 : Créer la base de données (Neon)

### 1.1 Créer un compte

Aller sur [neon.tech](https://neon.tech) et créer un compte gratuit.

### 1.2 Créer un projet

1. Cliquer sur **"New Project"**
2. Nom du projet : **foxclub**
3. Région : **Europe (Frankfurt)** ou la plus proche
4. PostgreSQL version : **15+**
5. Cliquer sur **"Create Project"**

### 1.3 Récupérer les URLs de connexion

Sur la page du projet, onglet **"Connection Details"** :

```
Connection string (pooled):
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/foxclub?sslmode=require
```

**Copier cette URL** - vous en aurez besoin pour Vercel.

**Important** : Neon fournit une seule URL qui fonctionne pour `DATABASE_URL` et `DIRECT_URL`.

---

## 🔧 Étape 2 : Configurer Vercel

### 2.1 Créer le projet

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New Project"**
3. Importer votre repository GitHub **jgvalence/foxclub**
4. Configurer :
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `./` (par défaut)
   - **Build Command** : `npm run build` (par défaut)

### 2.2 Configurer les variables d'environnement

Avant de déployer, ajouter les variables d'environnement :

Dans **"Environment Variables"**, ajouter :

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@...` (de Neon) | Production |
| `DIRECT_URL` | `postgresql://user:pass@...` (même URL) | Production |
| `NEXTAUTH_SECRET` | Générer avec `openssl rand -base64 32` | Production |
| `NEXTAUTH_URL` | `https://votre-app.vercel.app` | Production |
| `NODE_ENV` | `production` | Production |

**Génération du secret** :
```bash
openssl rand -base64 32
# Copier le résultat dans NEXTAUTH_SECRET
```

### 2.3 Déployer

Cliquer sur **"Deploy"** !

Vercel va :
1. Installer les dépendances (`npm install`)
2. Générer Prisma Client (`prisma generate`)
3. Appliquer les migrations (`prisma migrate deploy`)
4. Build Next.js (`next build`)
5. Déployer l'application

⏱️ Durée : **2-3 minutes**

---

## 🎯 Étape 3 : Initialiser la base de données

Une fois le déploiement terminé :

### 3.1 Récupérer les variables d'environnement

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet local
cd /home/user/foxclub
vercel link

# Télécharger les variables de production
vercel env pull .env.production
```

### 3.2 Appliquer le seed

```bash
# Utiliser les variables de production
export $(cat .env.production | xargs)

# Seed de la base de données
npm run db:seed
```

Ou créer un admin personnalisé :

```bash
ADMIN_EMAIL=votre@email.com ADMIN_PASSWORD=VotreMotDePasse123 npx tsx scripts/setup-production.ts
```

### 3.3 Vérifier le déploiement

1. Aller sur `https://votre-app.vercel.app`
2. Se connecter avec :
   - Email : `admin@foxclub.com`
   - Password : `admin123` (ou votre mot de passe personnalisé)

---

## 🔄 Intégration Continue (CI/CD)

### Configuration automatique

L'intégration continue est **déjà configurée** ! 🎉

Workflow automatique :

```
git push origin main
    ↓
GitHub détecte le push
    ↓
Vercel déclenche le build
    ↓
Tests (via GitHub Actions)
    ↓
Build + Migration + Déploiement
    ↓
Application live ✅
```

### Déploiements automatiques

- **Push sur `main`** → Déploiement en **production**
- **Push sur autre branche** → Déploiement en **preview**
- **Pull Request** → Preview avec URL unique

### Voir les logs

Vercel Dashboard → **Deployments** → Cliquer sur un déploiement → **Function Logs**

---

## 🎨 Étape 4 : Domaine personnalisé (Optionnel)

### 4.1 Ajouter un domaine

1. **Project Settings** → **Domains**
2. Ajouter votre domaine : `foxclub.com`
3. Configurer les DNS selon les instructions Vercel

### 4.2 Mettre à jour NEXTAUTH_URL

1. **Project Settings** → **Environment Variables**
2. Modifier `NEXTAUTH_URL` → `https://foxclub.com`
3. Redéployer

---

## ✅ Checklist Post-Déploiement

- [ ] Application accessible sur `https://votre-app.vercel.app`
- [ ] Connexion admin fonctionne
- [ ] Base de données seedée
- [ ] Tests passent (GitHub Actions)
- [ ] `NEXTAUTH_SECRET` généré de manière sécurisée
- [ ] Mot de passe admin changé

---

## 🔒 Sécurité

### Checklist de sécurité

- [x] `NEXTAUTH_SECRET` généré avec `openssl rand -base64 32`
- [ ] Mot de passe admin changé (pas `admin123`)
- [x] SSL/HTTPS activé (automatique avec Vercel)
- [x] Connexions DB en SSL (`?sslmode=require`)
- [x] `.env` dans `.gitignore`
- [ ] Monitoring activé (Sentry - optionnel)

---

## 🆘 Dépannage

### Erreur : "Prisma Client not found"

**Solution** : Le `postinstall` script est déjà configuré dans `package.json` ✅

### Erreur : "Can't reach database"

**Vérifications** :
1. `DATABASE_URL` correcte dans Vercel
2. SSL activé dans l'URL (`?sslmode=require`)
3. Tester localement :
   ```bash
   export DATABASE_URL="postgresql://..."
   npx prisma db pull
   ```

### Build timeout

**Solution** : Déjà configuré dans `vercel.json` avec `maxDuration: 30` ✅

### Migrations ne s'appliquent pas

**Solution** :
```bash
vercel env pull
npx prisma migrate deploy
```

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments** : Historique des déploiements
- **Analytics** : Trafic et performance
- **Logs** : Logs en temps réel

### Neon Dashboard

- **Monitoring** : Connexions actives
- **Queries** : Requêtes lentes
- **Storage** : Utilisation

---

## 🎉 C'est terminé !

Votre Fox Club est maintenant **déployé en production** ! 🦊

**Prochaines étapes** :
1. Changer le mot de passe admin
2. Créer les premières familles de questions
3. Inviter des utilisateurs
4. Configurer un domaine personnalisé

---

## 📚 Ressources

- [Documentation complète](./DEPLOYMENT.md)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
