require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  console.log('Inspection de la structure de la table "users"...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Erreur:', error.message);
    } else if (data && data.length > 0) {
      console.log('Colonnes trouvées dans "users" :');
      console.log(Object.keys(data[0]));
      console.log('Exemple de données (masquées) :');
      const example = { ...data[0] };
      if (example.password) example.password = '[MASKED]';
      console.log(example);
    } else {
      console.log('La table "users" est vide.');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

inspectSchema();
