require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getFiliere() {
  try {
    const { data, error } = await supabase
      .from('filieres')
      .select('id, nom')
      .limit(1);
    
    if (error) {
      console.error('Erreur:', error.message);
    } else {
      console.log('Filière trouvée :', data[0]);
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

getFiliere();
