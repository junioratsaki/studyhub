require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testBackendLoginQuery() {
  const matricule = '24IUC001'; // Tel qu'inséré en BD
  const email = 'christian.test2@iuc.cm';

  console.log(`Test de requête avec matricule: ${matricule} et email: ${email}`);
  
  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('matricule', matricule)
      .eq('email', email)
      .single();

    if (fetchError) {
      console.error('Erreur Supabase lors du select:', fetchError);
    } else if (!user) {
      console.log('Aucun utilisateur trouvé !');
    } else {
      console.log('Utilisateur trouvé avec succès:', user.email, user.matricule);
    }

    // Test avec minuscule pour voir si c'est sensible à la casse
    console.log(`\nTest de requête avec matricule en MINUSCULE: 24iuc001`);
    const { data: userLower, error: fetchErrorLower } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('matricule', '24iuc001')
      .eq('email', email)
      .single();

    if (fetchErrorLower) {
      console.error('Erreur (minuscule):', fetchErrorLower.message);
    } else {
      console.log('Trouvé avec minuscule:', !!userLower);
    }

  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
}

testBackendLoginQuery();
