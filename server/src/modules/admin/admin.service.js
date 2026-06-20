const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service d'administration
 */

async function getUsers({ page = 1, limit = 20, role, search }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('users')
    .select("*, filieres(nom)", { count: "exact" });

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
  const [users, subjects, corrections, sessions] = await Promise.allSettled([
    supabaseAdmin.from("users").select("id", { count: 'exact', head: true }),
    supabaseAdmin.from("subjects").select("id", { count: 'exact', head: true }),
    supabaseAdmin.from("corrections").select("id", { count: 'exact', head: true }),
    supabaseAdmin.from("ai_sessions").select("id", { count: 'exact', head: true })
  ]);

  const safeCount = (result) =>
    result.status === 'fulfilled' ? (result.value.count ?? 0) : 0;

  // Répartition par rôle (requête simple, pas de RPC)
  const { data: roleData } = await supabaseAdmin
    .from('users')
    .select('role');

  const roleDistribution = {};
  (roleData || []).forEach(u => {
    roleDistribution[u.role] = (roleDistribution[u.role] || 0) + 1;
  });

  return {
    total_users: safeCount(users),
    total_subjects: safeCount(subjects),
    total_corrections: safeCount(corrections),
    total_ai_sessions: safeCount(sessions),
    role_distribution: Object.entries(roleDistribution).map(([name, value]) => ({ name, value })),
  };
}

async function getLogs({ level, page = 1, limit = 50 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('audit_logs')
    .select("*, users(nom)", { count: "exact" });

  if (level) query = query.eq('level', level);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { data, count, page };
}

async function getPendingSubjects() {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .select(`
      *,
      users!author_id(nom, email),
      filieres(nom),
      matieres(nom),
      ai_scan_reports!scan_report_id(score_coherence, is_duplicate, comment)
    `)
    .eq('status', 'EN_ATTENTE')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Aplatir le rapport IA pour la commodité du frontend
  return (data || []).map(s => ({
    ...s,
    ai_scan_report: s.ai_scan_reports || null,
    ai_scan_reports: undefined,
  }));
}

async function updateSubjectStatus(subjectId, status) {
  const { data, error } = await supabaseAdmin
    .from('subjects')
    .update({ status })
    .eq('id', subjectId)
    .select()
    .single();

  if (error) throw error;
  return data;
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
  getPendingSubjects,
  updateSubjectStatus,
  createAnnouncement
};
