# Test Suite Documentation

Cette suite de tests valide les fonctionnalités principales de l'application MoodShot (clone Instagram).

## Tests Disponibles

### 1. Tests de Validation (`utils/validation.test.ts`)
- ✅ **Hachage des mots de passe** : Vérifie que bcrypt fonctionne correctement
- ✅ **Validation des emails** : Teste les formats d'email valides/invalides
- ✅ **Validation des noms d'utilisateur** : Vérifie les règles de noms d'utilisateur

### 2. Tests d'Inscription (`api/auth/register.test.ts`)
- ✅ **Création de compte réussie** : Teste l'inscription avec des données valides
- ✅ **Validation des données** : Rejette les emails/mots de passe invalides
- ✅ **Prévention des doublons** : Empêche les emails/usernames dupliqués
- ✅ **Sécurité des mots de passe** : Vérifie le hachage des mots de passe

### 3. Tests d'Authentification (`api/auth/auth.test.ts`)
- ✅ **Connexion réussie** : Teste l'authentification avec des identifiants valides
- ✅ **Rejet des identifiants invalides** : Teste les cas d'échec d'authentification
- ✅ **Gestion des sessions JWT** : Vérifie les callbacks JWT et session

### 4. Tests des Posts (`api/posts/posts.test.ts`)
- ✅ **Récupération des posts** : Teste l'endpoint GET /api/posts
- ✅ **Création de posts avec images** : Teste l'upload d'images
- ✅ **Authentification requise** : Vérifie que seuls les utilisateurs connectés peuvent poster
- ✅ **Validation des données** : Teste les cas d'erreur (pas d'image, etc.)

### 5. Tests d'Intégration (`integration/user-workflow.test.ts`)
- ✅ **Workflow complet utilisateur** : Inscription → Connexion → Création de post
- ✅ **Gestion des erreurs** : Teste les cas d'erreur dans le workflow complet
- ✅ **Intégrité des données** : Vérifie la cohérence des données en base

## Exécution des Tests

### Tests Locaux
```bash
# Tous les tests
npm test

# Tests spécifiques
npm test validation.test.ts
npm test register.test.ts
npm test auth.test.ts
npm test posts.test.ts
npm test user-workflow.test.ts

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Tests CI/CD
Les tests sont automatiquement exécutés dans GitHub Actions avec :
- Base de données PostgreSQL de test
- Variables d'environnement de test
- Migrations automatiques
- Génération du client Prisma

## Configuration de Test

### Variables d'Environnement
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/instagram_db_test?schema=public
NEXTAUTH_SECRET=test-secret
NEXTAUTH_URL=http://localhost:3000
```

### Base de Données de Test
- PostgreSQL 15
- Base séparée pour les tests (`instagram_db_test`)
- Nettoyage automatique entre les tests
- Migrations automatiques

## Fonctionnalités Testées

### ✅ Création de Compte
- Validation des données (email, mot de passe, nom, username)
- Hachage sécurisé des mots de passe
- Prévention des doublons
- Gestion des erreurs

### ✅ Connexion
- Authentification par email/mot de passe
- Génération de tokens JWT
- Gestion des sessions
- Rejet des identifiants invalides

### ✅ Post d'Images
- Upload de fichiers images
- Validation de l'authentification
- Stockage des métadonnées
- Gestion des erreurs

### ✅ Intégration Complète
- Workflow utilisateur de bout en bout
- Cohérence des données
- Gestion des états d'erreur

## Couverture de Code

Les tests couvrent :
- Routes API (`/api/auth/register`, `/api/posts`)
- Logique d'authentification
- Validation des données
- Gestion des erreurs
- Intégration base de données

## Prochaines Étapes

Pour étendre la suite de tests :
1. Tests des likes de posts
2. Tests de l'upload de fichiers réels
3. Tests de performance
4. Tests E2E avec Playwright
5. Tests de sécurité 