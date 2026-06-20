const { supabaseAdmin } = require('../../config/supabase');
const { signAccessToken, signRefreshToken } = require('../../config/jwt');
const { sendEmail } = require('../../config/resend');

async function register({ nom, matricule, email, role, filiere_id }) {
  // 1. Inscription Admin interdite ici
  if (role === 'ADMIN') {
    throw { status: 403, message: `Action interdite.` };
  }

  // 2. Vérification Matricule + Email obligatoires
  if (!matricule || !email) {
    throw { status: 400, message: 'Matricule et Email sont obligatoires.' };
  }

  // 3. Vérification si le matricule existe déjà
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('matricule', matricule)
    .single();

  if (existingUser) {
    throw { status: 400, message: 'Ce matricule est déjà enregistré.' };
  }

  // 4. Insertion (Sans password_hash car connexion via Email+Matricule)
  const { data: user, error: insertError } = await supabaseAdmin
    .from('users')
    .insert([{ 
      nom, 
      matricule,
      email, 
      role, 
      filiere_id,
      is_active: true
    }])
    .select()
    .single();

  if (insertError) throw insertError;

  return user;
}

async function login({ matricule, email }) {
  // 1. Trouver l'utilisateur qui possède CE matricule ET CET email
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('matricule', matricule)
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    throw { status: 401, message: 'Identifiants ERP incorrects (Matricule ou Email).' };
  }

  // 2. Vérifier si le compte est actif
  if (!user.is_active) {
    throw { status: 403, message: `Ce compte est désactivé.` };
  }

  // 3. Générer les tokens JWT (L'email et le matricule font office de preuve d'identité)
  const payload = { sub: user.id, matricule: user.matricule, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Pas de password_hash à masquer ici car il peut être nul
  return { accessToken, refreshToken, user };
}

async function refreshToken(token) {
  // 1. Vérifier le token (Signé par nous)
  // Note: Ici on devrait importer verifyRefreshToken depuis jwt.js
  const { verifyRefreshToken } = require('../../config/jwt');
  const payload = verifyRefreshToken(token);

  if (!payload) {
    throw { status: 401, message: 'Session expirée.' };
  }

  // 2. Vérifier l'utilisateur
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', payload.sub)
    .single();

  if (fetchError || !user || !user.is_active) {
    throw { status: 401, message: 'Session invalide.' };
  }

  const newAccessToken = signAccessToken({ sub: user.id, matricule: user.matricule, role: user.role });
  return { accessToken: newAccessToken };
}

module.exports = {
  register,
  login,
  refreshToken
};
