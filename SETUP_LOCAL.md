# 🔧 Configuration locale Fox Club

## Étape 1 : Récupérer votre connection string Neon

1. Allez sur [neon.tech](https://console.neon.tech)
2. Sélectionnez votre projet **neondb**
3. Cliquez sur **"Connection Details"**
4. **IMPORTANT** : Sélectionnez **"Pooled connection"** dans le menu déroulant
5. Copiez la connection string complète

Elle ressemble à :

```
postgresql://neondb_owner:VOTRE_PASSWORD@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **Ne pas inclure** `&channel_binding=require` à la fin

## Étape 2 : Mettre à jour le fichier .env

Ouvrez le fichier `.env` et remplacez les lignes :

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

Par votre connection string Neon.

**Exemple** :

```env
DATABASE_URL="postgresql://neondb_owner:VotrePassword@ep-xxx.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:VotrePassword@ep-xxx.neon.tech/neondb?sslmode=require"
```

## Étape 3 : Créer les tables (migration)

```bash
npm run db:migrate
```

Quand il vous demande un nom de migration, tapez : `init`

## Étape 4 : Remplir la base de données (seed)

```bash
npm run db:seed
```

Cela créera :

- 3 utilisateurs (admin, user, pending)
- 5 familles de questions
- 15 questions
- Données d'exemple

## Étape 5 : Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🔑 Identifiants de test

Après le seed :

**Admin** :

- Email : `admin@foxclub.com`
- Password : `admin123`

**User approuvé** :

- Email : `user@foxclub.com`
- Password : `user123`

**User en attente** :

- Email : `pending@foxclub.com`
- Password : `pending123`

---

## 🆘 Problèmes courants

### Erreur "Can't reach database server"

**Solution** : Vérifiez que :

1. Votre connection string Neon est correcte
2. Vous avez bien copié la **pooled connection** (pas la direct)
3. L'URL ne contient PAS `&channel_binding=require`
4. Votre projet Neon est actif (pas en pause)

### Erreur "Environment variable not found"

**Solution** : Assurez-vous que le fichier `.env` existe à la racine du projet.

### Prisma Client not found

**Solution** :

```bash
npm run db:generate
```

---

## ✅ Checklist de démarrage

- [ ] Projet Neon créé
- [ ] Connection string copiée (pooled, sans channel_binding)
- [ ] Fichier `.env` mis à jour
- [ ] `npm install` exécuté
- [ ] `npm run db:migrate` exécuté
- [ ] `npm run db:seed` exécuté
- [ ] `npm run dev` lancé
- [ ] http://localhost:3000 accessible
