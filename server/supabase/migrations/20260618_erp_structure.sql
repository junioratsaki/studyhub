-- 1. Création des tables de référence
CREATE TABLE IF NOT EXISTS campus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ecoles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    campus_id UUID REFERENCES campus(id)
);

CREATE TABLE IF NOT EXISTS filieres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    ecole_id UUID REFERENCES ecoles(id)
);

CREATE TABLE IF NOT EXISTS niveaux (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL -- ex: BTS, Licence, Master
);

-- 2. Mise à jour de la table utilisateurs
-- Ajout du matricule, filiere_id, et ajustement des contraintes
ALTER TABLE users ADD COLUMN IF NOT EXISTS matricule TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS filiere_id UUID REFERENCES filieres(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Pour l'authentification par matricule, nous supposerons que 'email' reste optionnel ou devient secondaire.
-- On s'assure que le rôle est bien typé
ALTER TABLE users ALTER COLUMN role TYPE TEXT; 
