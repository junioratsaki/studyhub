require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: SUPABASE_URL ou SUPABASE_SERVICE_KEY manquant dans le .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Tentative de connexion à Supabase...');
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      console.error('Erreur lors de la requête Supabase:', error.message);
    } else {
      console.log('Connexion réussie ! Réponse reçue de la table "users".');
      console.log('Nombre d\'enregistrements trouvés (limité à 1):', data.length);
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

testConnection();
