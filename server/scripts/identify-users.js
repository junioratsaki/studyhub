require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function identifyUsers() {
  console.log('Récupération des utilisateurs pour test...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('matricule, email, role, nom')
      .limit(5);
    
    if (error) {
      console.error('Erreur:', error.message);
    } else {
      console.log('Utilisateurs trouvés :');
      console.table(data);
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

identifyUsers();
