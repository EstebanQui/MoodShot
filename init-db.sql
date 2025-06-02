-- Script d'initialisation de la base de données Instagram Clone
-- Ce script est exécuté automatiquement lors du premier démarrage de PostgreSQL

-- Créer la base de données si elle n'existe pas déjà
-- (PostgreSQL crée automatiquement la DB spécifiée dans POSTGRES_DB)

-- Créer des extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Afficher un message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Base de données Instagram Clone initialisée avec succès!';
END $$; 