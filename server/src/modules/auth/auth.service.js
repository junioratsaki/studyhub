const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../../config/supabase');
const { signAccessToken, signRefreshToken } = require('../../config/jwt');
const { sendEmail } = require('../../config/resend');

async function register({ nom, email, password, role, filiere_id, code }) {
  // 1. Vérification du rôle ADMIN (Interdit via l'inscription publique)
  if (role === 'ADMIN') {
    throw { status: 403, message: `L'inscription en tant qu'administrateur est interdite via cette route.` };
  }

  // 2. Vérification du code d'accréditation pour les ENSEIGNANTS
  if (role === 'ENSEIGNANT') {
    if (!code) {
      throw { status: 400, message: `Un code d'accréditation est requis pour les enseignants.` };
    }

    const { data: accCode, error: accError } = await supabaseAdmin
      .from('accreditation_codes')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .single();

    if (accError || !accCode) {
      throw { status: 400, message: `Code d'accréditation invalide, utilisé ou expiré.` };
    }

    // Vérifier l'expiration
    if (new Date(accCode.expires_at) < new Date()) {
      throw { status: 400, message: `Le code d'accréditation a expiré.` };
    }
  }

  // 3. Vérification si l'utilisateur existe déjà
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw { status: 400, message: 'Cet email est déjà utilisé.' };
  }

  // 4. Hachage du mot de passe
  const password_hash = await bcrypt.hash(password, 12);

  // 5. Insertion dans la table users
  const { data: user, error: insertError } = await supabaseAdmin
    .from('users')
    .insert([{ 
      nom, 
      email, 
      password_hash, 
      role, 
      filiere_id,
    }])
    .select()
    .single();

  if (insertError) throw insertError;

  // 6. Marquer le code comme utilisé si c'est un enseignant
  if (role === 'ENSEIGNANT') {
    await supabaseAdmin
      .from('accreditation_codes')
      .update({ used: true })
      .eq('code', code);
  }

  // 7. Envoi de l'email de bienvenue (asynchrone)
  sendEmail({
    to: email,
    subject: 'Bienvenue sur StudyHub IUC !',
    html: `<p>Bonjour ${nom}, votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.</p>`,
  }).catch(err => console.error('Erreur email bienvenue:', err));

  // Retourner l'utilisateur sans le hash
  const { password_hash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function login({ email, password }) {
  // 1. Trouver l'utilisateur
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    throw { status: 401, message: 'Email ou mot de passe incorrect.' };
  }

  // 2. Vérifier si le compte est actif
  if (!user.is_active) {
    throw { status: 403, message: `Ce compte est désactivé. Veuillez contacter l'administration.` };
  }

  // 3. Comparer les mots de passe
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw { status: 401, message: 'Email ou mot de passe incorrect.' };
  }

  // 4. Générer les tokens JWT
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const { password_hash: _, ...userWithoutPassword } = user;
  return { accessToken, refreshToken, user: userWithoutPassword };
}

async function refreshToken(token) {
  // 1. Vérifier le refresh token
  const payload = verifyRefreshToken(token);

  // 2. Récupérer l"utilisateur pour s'assurer qu"il existe toujours et est actif
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', payload.sub)
    .single();

  if (fetchError || !user || !user.is_active) {
    throw { status: 401, message: 'Session invalide ou compte désactivé.' };
  }

  // 3. Générer un nouvel access token
  const newAccessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { accessToken: newAccessToken };
}

async function forgotPassword(email) {
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (fetchError || !user) {
    // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
    return { success: true, message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' };
  }

  // Générer un token unique (uuid) et une expiration (1h)
  const resetToken = require('uuid').v4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      reset_token: resetToken, 
      reset_token_expires: expiresAt 
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  // Envoyer l'email avec le lien
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a>. Ce lien expire dans 1 heure.</p>`,
  });

  return { success: true, message: 'Lien de réinitialisation envoyé.' };
}

async function resetPassword(token, newPassword) {
  // 1. Trouver l'utilisateur avec ce token et non expiré
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('reset_token', token)
    .gt('reset_token_expires', new Date().toISOString())
    .single();

  if (fetchError || !user) {
    throw { status: 400, message: 'Token invalide ou expiré.' };
  }

  // 2. Hacher le nouveau mot de passe
  const password_hash = await bcrypt.hash(newPassword, 12);

  // 3. Mettre à jour et supprimer le token de reset
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ 
      password_hash, 
      reset_token: null, 
      reset_token_expires: null 
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  return { success: true, message: 'Mot de passe mis à jour avec succès.' };
}

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
