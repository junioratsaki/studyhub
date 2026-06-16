const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service d'administration
 */

async function getUsers({ page = 1, limit = 20, role, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('users')
    .select('*, filieres(nom)', { count: 'exact' });

  if (role) query = query.eq('role', role);
  if (search) query = query.ilike('nom', `%${search}%`);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data.map(u => {
      const { password_hash, ...rest } = u;
      return rest;
    }),
    count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

async function blockUser(userId, block) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ is_active: !block })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteUser(userId) {
  const { error } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
  return { success: true };
}

async function generateCode(adminId) {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('accreditation_codes')
    .insert([{
      code,
      created_by: adminId,
      expires_at: expiresAt,
      used: false
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function getStats() {
  const [users, subjects, corrections, sessions] = await Promise.all([
    supabaseAdmin.from('users').select('role', { count: 'exact', head: true }), // Just an example, need group by
    supabaseAdmin.from('subjects').select('status', { count: 'exact', head: true }),
    supabaseAdmin.from('corrections').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('ai_sessions').select('id', { count: 'exact', head: true })
  ]);

  // Pour des stats plus détaillées, on ferait des requêtes spécifiques
  const { data: userStats } = await supabaseAdmin.rpc('get_user_stats_by_role'); 
  // Note: RPC requis pour group by propre ou faire plusieurs requêtes

  return {
    total_users: users.count,
    total_subjects: subjects.count,
    total_corrections: corrections.count,
    total_ai_sessions: sessions.count
  };
}

async function getLogs({ level, page = 1, limit = 50 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('audit_logs')
    .select('*, users(nom)', { count: 'exact' });

  if (level) query = query.eq('level', level);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count, page };
}

async function createAnnouncement({ title, content, adminId }) {
  const { data, error } = await supabaseAdmin
    .from('announcements')
    .insert([{
      title,
      content,
      created_by: adminId,
      type: 'info'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  getUsers,
  blockUser,
  deleteUser,
  generateCode,
  getStats,
  getLogs,
  createAnnouncement
};
