require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchema() {
  console.log('Tentative de mise à jour du schéma de la table "users"...');
  
  // Note: Supabase JS client ne permet pas de faire des ALTER TABLE directement.
  // Je vais essayer d'insérer un utilisateur avec matricule pour voir si c'est juste un problème de lecture 
  // ou si la colonne manque vraiment (ce que l'inspection a confirmé).
  
  // Comme je n'ai pas accès à SQL via le client JS pour modifier la structure,
  // je vais vérifier si un utilisateur existe déjà sans matricule et essayer de lui en donner un
  // si la colonne matricule était "cachée" (peu probable).
  
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    console.log('Utilisateur trouvé pour test de mise à jour:', user.email);

    // Tentative d'update avec matricule
    const { error: updateError } = await supabase
      .from('users')
      .update({ matricule: '24IUC001' })
      .eq('id', user.id);

    if (updateError) {
      console.error('ALERTE : La colonne "matricule" n\'existe vraiment pas dans la base Supabase.');
      console.error('Détail:', updateError.message);
      console.log('--- SOLUTION ---');
      console.log('Vous devez exécuter ce SQL dans votre console Supabase :');
      console.log('ALTER TABLE users ADD COLUMN matricule TEXT UNIQUE;');
      console.log('UPDATE users SET matricule = \'24IUC001\' WHERE email = \'' + user.email + '\';');
    } else {
      console.log('Succès ! La colonne matricule existait déjà ou a été acceptée.');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err.message);
  }
}

fixSchema();
