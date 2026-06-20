require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant dans le .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearUsers() {
  console.log('--- ATTENTION ---');
  console.log('Tentative de suppression de TOUS les utilisateurs de la table "users"...');
  
  try {
    // Dans Supabase, pour supprimer tous les records sans filtre, on peut utiliser .neq('id', '00000000-0000-0000-0000-000000000000') 
    // ou simplement un filtre qui match tout si la table utilise des UUIDs.
    const { data, error, count } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Filtre bidon pour matcher tout le monde

    if (error) {
      console.error('Erreur lors de la suppression:', error.message);
      if (error.message.includes('violates foreign key constraint')) {
        console.log('Note: Certains utilisateurs ne peuvent pas être supprimés car ils sont liés à d\'autres tables (ex: filieres, subjects).');
      }
    } else {
      console.log(`Succès ! ${count} utilisateur(s) ont été supprimés.`);
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

clearUsers();
