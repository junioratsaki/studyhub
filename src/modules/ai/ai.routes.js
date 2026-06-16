const express = require('express');
const router = express.Router();
const aiService = require('./ai.service');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');
const { uploadSingle } = require('../../middlewares/upload');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// --- SCHÉMAS DE VALIDATION ZOD ---

const scanSchema = z.object({
  description: z.string().min(10, 'Une description plus détaillée est requise pour le scan IA'),
});

const eduBotSessionSchema = z.object({
  subjectId: z.string().uuid('ID de sujet invalide'),
});

// --- ROUTES ---

/**
 * Scan IA d'un document (interne ou manuel pour test)
 */
router.post('/scan', auth, uploadSingle, validate(scanSchema), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Fichier PDF ou Image requis' });
    }

    const result = await aiService.scanDocument({
      fileBuffer: req.file.buffer,
      mimetype: req.file.mimetype,
      description: req.body.description
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Créer une nouvelle session EduBot
 */
router.post('/edubot/session', auth, rbac.requireRole('ETUDIANT'), validate(eduBotSessionSchema), async (req, res, next) => {
  try {
    const session = await aiService.createEduBotSession({
      subjectId: req.body.subjectId,
      userId: req.user.id
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});

/**
 * Stream de la conversation EduBot (SSE)
 */
router.get('/edubot/stream/:sessionId', auth, async (req, res, next) => {
  try {
    const { message } = req.query; // Le message est passé en query param pour simplifier le GET SSE
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message requis' });
    }

    await aiService.streamEduBot({
      sessionId: req.params.sessionId,
      userMessage: message,
      res
    });
  } catch (err) {
    // Si c'est une erreur avant que le stream ne commence
    if (!res.headersSent) {
      next(err);
    } else {
      console.error('[AIRoutes] Erreur pendant le stream:', err);
      res.end();
    }
  }
});

module.exports = router;
