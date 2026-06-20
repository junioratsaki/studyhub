const express = require('express');
const router = express.Router();
const subjectsService = require('./subjects.service');
const auth = require('../../middlewares/auth');
const { uploadSingle } = require('../../middlewares/upload');
const { requireRole } = require('../../middlewares/rbac');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');
const { supabaseAdmin } = require('../../config/supabase');

// --- SCHÉMAS DE VALIDATION ZOD ---

const subjectSchema = z.object({
  title: z.string().min(3, 'Le titre est trop court'),
  description: z.string().optional(),
  filiere_id: z.string().uuid('ID de filière invalide'),
  matiere_id: z.string().uuid('ID de matière invalide'),
  annee: z.number().int().min(1900).max(2100),
  type_examen: z.enum(["NORMAL", "RATTRAPAGE", "CC", "TP"]),
});

// --- ROUTES ---

// Liste des sujets avec filtres
router.get('/', auth, async (req, res, next) => {
  try {
    const { ecole, filiere_id, matiere_id, annee, type_examen, page } = req.query;
    const result = await subjectsService.getSubjects({ 
      ecole,
      filiere_id, 
      matiere_id, 
      annee: annee ? parseInt(annee) : undefined, 
      type_examen, 
      page: parseInt(page) || 1 
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Recherche de sujets
router.get('/search', auth, async (req, res, next) => {
  try {
    const { q, filiere_id, page } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Le terme de recherche est requis' });
    
    const result = await subjectsService.searchSubjects({ 
      q, 
      filiere_id, 
      page: parseInt(page) || 1 
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Détail d'un sujet
router.get('/:id', auth, async (req, res, next) => {
  try {
    const result = await subjectsService.getSubjectById(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Upload d'un nouveau sujet
router.post('/', auth, uploadSingle, validate(subjectSchema), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Le fichier PDF est obligatoire' });
    }

    const subject = await subjectsService.createSubject({
      file: req.file,
      body: req.body,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: subject });
  } catch (err) {
    next(err);
  }
});

// Suppression d'un sujet
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await subjectsService.deleteSubject(req.params.id, req.user);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

// Forcer la publication (ADMIN seulement)
router.put("/:id/force-publish", auth, requireRole("ADMIN"), async (req, res, next) => {
  // Cette logique sera ajoutée au service
  try {
    const { data, error } = await supabaseAdmin
      .from('subjects')
      .update({ status: 'PUBLIE' })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Liste des filières
router.get('/filieres', async (req, res, next) => {
  try {
    const result = await subjectsService.getFilieres();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Liste des matières
router.get('/matieres', async (req, res, next) => {
  try {
    const { filiere_id } = req.query;
    const result = await subjectsService.getMatieres(filiere_id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
