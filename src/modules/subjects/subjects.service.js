const { supabaseAdmin } = require('../../config/supabase');

/**
 * Service de gestion des sujets d'examen
 */

async function uploadToStorage(fileBuffer, mimetype, filiere_id) {
  const { v4: uuidv4 } = require('uuid');
  const fileName = `${filiere_id}/${uuidv4()}.${mimetype.split('/')[1]}`;

  const { data, error } = await supabaseAdmin.storage
    .from('subjects')
    .upload(fileName, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw error;

  // Récupérer l'URL publique
  const { data: publicUrlData } = supabaseAdmin.storage
    .from('subjects')
    .getPublicUrl(fileName);

  return { 
    file_url: publicUrlData.publicUrl, 
    storage_path: fileName 
  };
}

async function createSubject({ file, body, userId }) {
  // 1. Upload du fichier vers Supabase Storage
  const { file_url, storage_path } = await uploadToStorage(
    file.buffer, 
    file.mimetype, 
    body.filiere_id
  );

  // 2. Appel au scan IA
  let status = 'EN_ATTENTE';
  let scanReportId = null;

  try {
    const aiService = require('./../ai/ai.service');
    const scanResult = await aiService.scanDocument({
      fileBuffer: file.buffer,
      mimetype: file.mimetype,
      description: body.description || body.title
    });

    if (scanResult.passed) {
      status = 'PUBLIE';
    }
    scanReportId = scanResult.report.id;
  } catch (err) {
    console.warn('[SubjectsService] AI Scan échoué ou erreur:', err.message);
    // On garde le statut EN_ATTENTE si l'IA échoue ou si le score est bas
    status = 'EN_ATTENTE';
  }

  // 3. Insertion dans la base de données
  const { data: subject, error: insertError } = await supabaseAdmin
    .from('subjects')
    .insert([{
      title: body.title,
      description: body.description,
      file_url,
      storage_path,
      filiere_id: body.filiere_id,
      matiere_id: body.matiere_id,
      annee: body.annee,
      type_examen: body.type_examen,
      author_id: userId,
      status: status,
      scan_report_id: scanReportId
    }])
    .select()
    .single();

  if (insertError) {
    // Si erreur, on tente de supprimer le fichier orphelin du storage
    await supabaseAdmin.storage.from('subjects').remove([storage_path]);
    throw insertError;
  }

  // 4. Mettre à jour le rapport de scan avec l'ID du sujet
  if (scanReportId) {
    await supabaseAdmin
      .from('ai_scan_reports')
      .update({ subject_id: subject.id })
      .eq('id', scanReportId);
  }

  return subject;
}

async function getSubjects({ ecole, filiere_id, matiere_id, annee, type_examen, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('subjects')
    .select('*, filieres!inner(nom, ecole), matieres(nom)', { count: 'exact' })
    .eq('status', 'PUBLIE');

  if (ecole) query = query.eq('filieres.ecole', ecole);
  if (filiere_id) query = query.eq('filiere_id', filiere_id);
  if (matiere_id) query = query.eq('matiere_id', matiere_id);
  if (annee) query = query.eq('annee', annee);
  if (type_examen) query = query.eq('type_examen', type_examen);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

async function searchSubjects({ q, filiere_id, page = 1, limit = 20 }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from('subjects')
    .select('*, filieres(nom), matieres(nom)', { count: 'exact' })
    .eq('status', 'PUBLIE')
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`);

  if (filiere_id) query = query.eq('filiere_id', filiere_id);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

async function getSubjectById(id, userId) {
  // 1. Récupérer le sujet et ses corrections
  const { data: subject, error: sError } = await supabaseAdmin
    .from('subjects')
    .select('*, filieres(nom), matieres(nom)')
    .eq('id', id)
    .single();

  if (sError || !subject) throw { status: 404, message: 'Sujet non trouvé' };

  const { data: corrections, error: cError } = await supabaseAdmin
    .from('corrections')
    .select('*')
    .eq('subject_id', id)
    .eq('status', 'PUBLIE');

  if (cError) throw cError;

  // 2. Incrémenter le nombre de vues (Simple update si RPC non présent)
  await supabaseAdmin
    .from('subjects')
    .update({ nombre_vues: (subject.nombre_vues || 0) + 1 })
    .eq('id', id);

  // 3. Enregistrer dans l'historique de lecture
  await supabaseAdmin
    .from('reading_history')
    .upsert({ 
      user_id: userId, 
      subject_id: id, 
      last_read_at: new Date().toISOString() 
    }, { onConflict: 'user_id, subject_id' });

  return { subject, corrections };
}

async function deleteSubject(id, requestingUser) {
  // 1. Vérifier les droits
  const { data: subject } = await supabaseAdmin
    .from('subjects')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!subject) throw { status: 404, message: 'Sujet non trouvé' };

  if (subject.author_id !== requestingUser.id && requestingUser.role !== 'ADMIN') {
    throw { status: 403, message: `Vous n'avez pas les droits pour supprimer ce sujet` };
  }

  // 2. Supprimer le fichier du Storage
  const { data: subjectData } = await supabaseAdmin
    .from('subjects')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (subjectData?.storage_path) {
    await supabaseAdmin.storage.from('subjects').remove([subjectData.storage_path]);
  }

  // 3. Supprimer l'enregistrement (cascade supprimera corrections, etc.)
  const { error } = await supabaseAdmin
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return { success: true, message: 'Sujet supprimé avec succès' };
}

module.exports = {
  uploadToStorage,
  createSubject,
  getSubjects,
  searchSubjects,
  getSubjectById,
  deleteSubject,
};
