-- =====================================================================
-- STUDYHUB IUC - 004_IMPORT_STUDENTS.SQL
-- Modèle pour l'import massif des étudiants par l'administration
-- =====================================================================

/* 
   INSTRUCTIONS :
   1. Remplacez les valeurs dans le bloc 'VALUES' par vos données réelles.
   2. Le mot de passe n'est pas nécessaire car la connexion se fait par Email + Matricule.
   3. Assurez-vous que les UUID des filières existent dans la table 'filieres'.
*/

-- Exemple d'insertion d'étudiants
-- INSERT INTO public.users (nom, email, matricule, role, filiere_id, is_active, password_hash)
-- VALUES 
-- ('Nom Etudiant 1', 'email1@myiuc.com', '24IUC001', 'ETUDIANT', 'UUID_FILIERE_ICI', true, 'NO_PASSWORD'),
-- ('Nom Etudiant 2', 'email2@myiuc.com', '24IUC002', 'ETUDIANT', 'UUID_FILIERE_ICI', true, 'NO_PASSWORD');

-- NOTE : 'NO_PASSWORD' est utilisé ici comme placeholder car le flux d'auth ERP 
-- ne vérifie plus le password_hash. Cependant, la colonne est NOT NULL dans le schéma original.
-- On peut mettre n'importe quelle chaîne ou modifier la contrainte.

-- Pour supprimer la contrainte NOT NULL sur password_hash si nécessaire :
-- ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
