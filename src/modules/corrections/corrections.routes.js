const express = require('express');
const router = express.Router();
const correctionsService = require('./corrections.service');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');
const { uploadOptional } = require('../../middlewares/upload');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// --- SCHÉMAS DE VALIDATION ---

const publishCorrectionSchema = z.object({
  content: z.string().optional(),
  source: z.enum(["OFFICIELLE", "IA_GENEREE"]).default("OFFICIELLE"),
});

// --- ROUTES ---

/**
 * Récupérer toutes les corrections d'un sujet
 */
router.get('/subject/:id', auth, async (req, res, next) => {
  try {
    const corrections = await correctionsService.getCorrections(req.params.id, req.user.role);
    res.json({ success: true, data: corrections });
  } catch (err) {
    next(err);
  }
});

/**
 * Publier une nouvelle correction (ENSEIGNANT ou ADMIN uniquement)
 */
router.post('/subject/:id', 
  auth, 
  rbac.requireRole("ENSEIGNANT", "ADMIN"), 
  uploadOptional, 
  validate(publishCorrectionSchema), 
  async (req, res, next) => {
    try {
      const correction = await correctionsService.publishCorrection({
        subjectId: req.params.id,
        content: req.body.content,
        file: req.file,
        source: req.body.source,
        userId: req.user.id
      });

      res.status(201).json({ success: true, data: correction });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Valider une correction (ex: passer de IA_GENEREE/BROUILLON à PUBLIE)
 */
router.put('/:id/validate', 
  auth, 
  rbac.requireRole("ENSEIGNANT", "ADMIN"), 
  async (req, res, next) => {
    try {
      const result = await correctionsService.validateCorrection(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Supprimer une correction
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await correctionsService.deleteCorrection(req.params.id, req.user);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
