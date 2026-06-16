const { supabaseAdmin } = require('../../config/supabase');
const { v4: uuidv4 } = require('uuid');

/**
 * Service de gestion des corrections
 */

async function uploadCorrectionFile(fileBuffer, mimetype) {
  const fileName = `corrections/${uuidv4()}.${mimetype.split('/')[1]}`;

  const { data, error } = await supabaseAdmin.storage
    .from('corrections')
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('corrections')
    .getPublicUrl(fileName);

  return { 
    file_url: publicUrlData.publicUrl, 
    storage_path: fileName 
  };
}

async function publishCorrection({ subjectId, content, file, source, userId }) {
  let file_url = null;
  let storage_path = null;

  // 1. Gérer l'upload si un fichier est fourni
  if (file) {
    const uploadResult = await uploadCorrectionFile(file.buffer, file.mimetype);
    file_url = uploadResult.file_url;
    storage_path = uploadResult.storage_path;
  }

  // 2. Déterminer le statut initial
  // OFFICIELLE -> PUBLIE immédiatement
  // IA_GENEREE -> BROUILLON par défaut (doit être validée par un prof)
  const status = source === 'OFFICIELLE' ? 'PUBLIE' : 'BROUILLON';

  // 3. Insertion
  const { data, error } = await supabaseAdmin
    .from('corrections')
    .insert([{
      subject_id: subjectId,
      author_id: userId,
      content,
      file_url,
      storage_path,
      source,
      status
    }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function getCorrections(subjectId, userRole) {
  let query = supabaseAdmin
    .from('corrections')
    .select('*, users(nom)')
    .eq('subject_id', subjectId);

  // Un étudiant ne voit que les corrections publiées
  if (userRole === 'ETUDIANT') {
    query = query.eq('status', 'PUBLIE');
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function validateCorrection(correctionId) {
  const { data, error } = await supabaseAdmin
    .from('corrections')
    .update({ status: 'PUBLIE' })
    .eq('id', correctionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCorrection(correctionId, requestingUser) {
  // 1. Vérifier les droits
  const { data: correction, error: fError } = await supabaseAdmin
    .from('corrections')
    .select('author_id, storage_path')
    .eq('id', correctionId)
    .single();

  if (fError || !correction) throw { status: 404, message: 'Correction non trouvée' };

  if (correction.author_id !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    throw { status: 403, message: 'Non autorisé à supprimer cette correction' };
  }

  // 2. Supprimer le fichier du storage si présent
  if (correction.storage_path) {
    await supabaseAdmin.storage.from('corrections').remove([correction.storage_path]);
  }

  // 3. Supprimer l'entrée en DB
  const { error } = await supabaseAdmin
    .from('corrections')
    .delete()
    .eq('id', correctionId);

  if (error) throw error;

  return { success: true, message: 'Correction supprimée' };
}

module.exports = {
  publishCorrection,
  getCorrections,
  validateCorrection,
  deleteCorrection
};
