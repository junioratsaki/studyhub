const bcrypt = require('bcrypt');
const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service de gestion des utilisateurs et de leurs préférences
 */
async function getProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, nom, email, role, filiere_id, avatar_url, is_active, created_at')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

async function updateProfile(userId, { nom, avatar_url, filiere_id }) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ nom, avatar_url, filiere_id })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  // 1. Récupérer le hash actuel
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (fetchError || !user) {
    throw { status: 404, message: 'Utilisateur non trouvé' };
  }

  // 2. Vérifier l'ancien mot de passe
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw { status: 400, message: 'Le mot de passe actuel est incorrect' };
  }

  // 3. Hacher le nouveau mot de passe
  const newHash = await bcrypt.hash(newPassword, 12);

  // 4. Mise à jour
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ password_hash: newHash })
    .eq('id', userId);

  if (updateError) throw updateError;

  return { success: true, message: 'Mot de passe mis à jour avec succès' };
}

async function getHistory(userId, { page = 1, limit = 10 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabaseAdmin
    .from('reading_history')
    .select('*, subjects(*)')
    .eq('user_id', userId)
    .order('last_read_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return data;
}

async function getFavorites(userId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .select('*, subjects(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

async function addFavorite(userId, subjectId) {
  const { data, error } = await supabaseAdmin
    .from('favorites')
    .insert([{ user_id: userId, subject_id: subjectId }])
    .select()
    .single();

  if (error) {
    // Si c'est une erreur de contrainte UNIQUE, on peut l'ignorer ou informer l'utilisateur
    if (error.code === '23505') {
      return { success: true, message: 'Sujet déjà en favoris' };
    }
    throw error;
  }
  return data;
}

async function removeFavorite(userId, subjectId) {
  const { error } = await supabaseAdmin
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('subject_id', subjectId);

  if (error) throw error;
  return { success: true, message: 'Favori supprimé' };
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
};
