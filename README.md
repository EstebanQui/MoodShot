# Instagram Clone - Projet Docker

Une application web Instagram-like construite avec Next.js, React, TypeScript, Prisma, PostgreSQL et dockerisée avec Docker Compose.

## 🚀 Technologies Utilisées

### Frontend
- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes

### Backend & Base de données
- **Next.js API Routes** - API Backend
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données relationnelle
- **NextAuth.js** - Authentification

### Data Fetching & State
- **SWR** - Data fetching et cache

### DevOps & Déploiement
- **Docker** - Containerisation
- **Docker Compose** - Orchestration des services
- **GitHub Actions** - CI/CD Pipeline

## 📋 Fonctionnalités

- ✅ **Authentification** : Inscription et connexion des utilisateurs
- ✅ **Upload de photos** : Drag & drop pour uploader des images
- ✅ **Feed de posts** : Affichage des posts en temps réel
- ✅ **Système de likes** : Like/unlike des posts
- ✅ **Interface responsive** : Design adaptatif mobile/desktop
- ✅ **Base de données relationnelle** : Gestion des utilisateurs, posts et likes
- ✅ **Dockerisation complète** : Frontend, Backend et BDD containerisés

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Installation et Démarrage

### Prérequis
- Docker et Docker Compose installés
- Git

### 1. Cloner le projet
```bash
git clone <repository-url>
cd instagram-clone
```

### 2. Démarrer avec Docker Compose
```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en arrière-plan
docker-compose up --build -d
```

### 3. Accéder à l'application
- **Application** : http://localhost:3000
- **Adminer (DB Admin)** : http://localhost:8080
  - Système : PostgreSQL
  - Serveur : postgres
  - Utilisateur : postgres
  - Mot de passe : password
  - Base de données : instagram_db

## 🛠️ Développement Local

### Installation des dépendances
```bash
npm install
```

### Variables d'environnement
Copier `.env.example` vers `.env` et ajuster les valeurs :
```bash
cp .env.example .env
```

### Base de données locale
```bash
# Démarrer seulement PostgreSQL
docker-compose up postgres -d

# Appliquer les migrations
npx prisma migrate dev

# Générer le client Prisma
npx prisma generate
```

### Démarrer en mode développement
```bash
npm run dev
```

## 🐳 Docker

### Services Docker Compose

1. **postgres** : Base de données PostgreSQL
   - Image : `postgres:15-alpine`
   - Port : `5432`
   - Volume persistant pour les données

2. **app** : Application Next.js
   - Build depuis le Dockerfile local
   - Port : `3000`
   - Volume pour les uploads d'images

3. **adminer** : Interface d'administration DB
   - Image : `adminer:latest`
   - Port : `8080`

### Commandes Docker utiles

```bash
# Construire l'image
docker-compose build

# Démarrer les services
docker-compose up

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f app

# Accéder au container
docker-compose exec app sh

# Nettoyer les volumes
docker-compose down -v
```

## 🔄 CI/CD Pipeline

Le projet inclut une pipeline GitHub Actions qui :

1. **Test** : Installe les dépendances, génère Prisma, lance les migrations et build
2. **Build & Push** : Construit l'image Docker et la pousse vers GitHub Container Registry
3. **Deploy** : Placeholder pour le déploiement en production

### Configuration requise
- Repository GitHub avec Actions activées
- Permissions pour GitHub Container Registry

## 📊 Base de données

### Modèles Prisma

- **User** : Utilisateurs de l'application
- **Post** : Posts avec images
- **Like** : Système de likes
- **Follow** : Système de suivi (préparé pour extension future)

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name <nom-migration>

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la DB (développement uniquement)
npx prisma migrate reset
```

## 🔧 Scripts NPM

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm run start        # Démarrage en mode production
npm run lint         # Linting du code
```

## 📁 Structure du Projet

```
instagram-clone/
├── src/
│   ├── app/                 # App Router Next.js
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Pages d'authentification
│   │   └── page.tsx        # Page d'accueil
│   ├── components/         # Composants React
│   ├── lib/               # Utilitaires et configurations
│   └── types/             # Types TypeScript
├── prisma/
│   ├── schema.prisma      # Schéma de base de données
│   └── migrations/        # Migrations SQL
├── public/
│   └── uploads/           # Images uploadées
├── docker-compose.yml     # Orchestration Docker
├── Dockerfile            # Image de l'application
└── .github/workflows/    # CI/CD GitHub Actions
```

## 🔒 Sécurité

- Authentification avec NextAuth.js
- Hashage des mots de passe avec bcryptjs
- Validation des données avec Zod
- Variables d'environnement pour les secrets
- Utilisateur non-root dans Docker

## 🚀 Déploiement en Production

### Variables d'environnement de production
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-key
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Recommandations
- Utiliser un service de base de données managé (AWS RDS, Google Cloud SQL, etc.)
- Configurer un CDN pour les images statiques
- Utiliser HTTPS en production
- Configurer la surveillance et les logs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez que Docker et Docker Compose sont installés
2. Assurez-vous que les ports 3000, 5432 et 8080 sont libres
3. Consultez les logs avec `docker-compose logs`
4. Ouvrez une issue sur GitHub

---

**Développé avec ❤️ pour le projet Docker** 