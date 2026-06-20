const { supabaseAdmin } = require('../../config/supabase');

async function getAllReferentiel() {
  // Récupérer tout le référentiel pour peupler les formulaires frontend
  const [campus, ecoles, niveaux, filieres] = await Promise.all([
    supabaseAdmin.from('campus').select('*').order('nom'),
    supabaseAdmin.from('ecoles').select('*').order('nom'),
    supabaseAdmin.from('niveaux').select('*').order('nom'),
    supabaseAdmin.from('filieres').select('*, ecole:ecoles(nom), niveau:niveaux(nom)').order('nom')
  ]);

  if (campus.error) throw campus.error;
  if (ecoles.error) throw ecoles.error;
  if (niveaux.error) throw niveaux.error;
  if (filieres.error) throw filieres.error;

  return {
    campus: campus.data,
    ecoles: ecoles.data,
    niveaux: niveaux.data,
    filieres: filieres.data
  };
}

async function getFilieresByEcole(ecoleId) {
  const { data, error } = await supabaseAdmin
    .from('filieres')
    .select('*, niveau:niveaux(nom)')
    .eq('ecole_id', ecoleId);
  
  if (error) throw error;
  return data;
}

module.exports = {
  getAllReferentiel,
  getFilieresByEcole
};
