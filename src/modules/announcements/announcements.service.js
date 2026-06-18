const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service de gestion des annonces de la plateforme
 */

async function getAllAnnouncements() {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function createAnnouncement({ title, content, type = 'info' }) {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .insert([{ title, content, type }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteAnnouncement(id) {
  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
