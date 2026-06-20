/**
 * Script de création d'un compte administrateur StudyHub
 * Usage : node scripts/create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../src/config/supabase');

// ─── Identifiants de l'administrateur ─────────────────────────────────────
const ADMIN = {
  nom: 'Administrateur StudyHub',
  email: 'admin@studyhub.com',
  password: 'Admin@2025!',
  role: 'ADMIN',
};
// ──────────────────────────────────────────────────────────────────────────

async function createAdmin() {
  console.log('\n🔐 Création du compte administrateur...\n');

  // 1. Vérifier si l'admin existe déjà
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('email', ADMIN.email)
    .single();

  if (existing) {
    console.log(`⚠️  Un utilisateur avec l'email "${ADMIN.email}" existe déjà.`);
    console.log(`   ID   : ${existing.id}`);
    console.log(`   Rôle : ${existing.role}`);
    
    if (existing.role !== 'ADMIN') {
      console.log('\n📝 Mise à jour du rôle en ADMIN...');
      const { error } = await supabaseAdmin
        .from('users')
        .update({ role: 'ADMIN', is_active: true })
        .eq('id', existing.id);
      
      if (error) {
        console.error('❌ Erreur lors de la mise à jour :', error.message);
        process.exit(1);
      }
      console.log('✅ Rôle mis à jour avec succès !');
    } else {
      console.log('\n✅ Cet utilisateur est déjà administrateur.');
    }
    printCredentials();
    return;
  }

  // 2. Hasher le mot de passe
  console.log('⚙️  Hachage du mot de passe (bcrypt, 12 rounds)...');
  const password_hash = await bcrypt.hash(ADMIN.password, 12);

  // 3. Insérer l'admin en base
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .insert([{
      nom: ADMIN.nom,
      email: ADMIN.email,
      password_hash,
      role: ADMIN.role,
      is_active: true,
    }])
    .select('id, nom, email, role, created_at')
    .single();

  if (error) {
    console.error('❌ Erreur lors de la création :', error.message);
    process.exit(1);
  }

  console.log('\n✅ Administrateur créé avec succès !');
  console.log('─'.repeat(40));
  console.log(`   Nom      : ${user.nom}`);
  console.log(`   ID       : ${user.id}`);
  console.log(`   Rôle     : ${user.role}`);
  console.log(`   Créé le  : ${new Date(user.created_at).toLocaleString('fr-FR')}`);
  printCredentials();
}

function printCredentials() {
  console.log('\n🔑 Identifiants de connexion :');
  console.log('─'.repeat(40));
  console.log(`   Email    : ${ADMIN.email}`);
  console.log(`   Password : ${ADMIN.password}`);
  console.log('─'.repeat(40));
  console.log('\n🌐 Connectez-vous sur : http://localhost:5173/login');
  console.log('   Puis naviguez vers   : http://localhost:5173/admin\n');
}

createAdmin().catch(err => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});
