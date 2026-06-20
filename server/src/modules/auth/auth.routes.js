const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/rbac');

// --- SCHÉMAS DE VALIDATION ZOD (Version ERP) ---

const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom est trop court'),
  matricule: z.string().min(3, 'Le matricule est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  role: z.enum(["ETUDIANT", "ENSEIGNANT", "ADMIN"]),
  filiere_id: z.string().uuid('ID de filière invalide').optional(),
  code: z.string().optional(),
});

const loginSchema = z.object({
  matricule: z.string().min(1, 'Le matricule est requis'),
  email: z.string().email('Email invalide'),
});

// Trigger nodemon reload

// --- HANDLERS ---

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Inscrire un nouvel utilisateur (ADMIN UNIQUEMENT)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
// INSCRIPTION PUBLIQUE DÉSACTIVÉE : Seul un ADMIN peut créer des comptes
router.post('/register', auth, requireRole('ADMIN'), validate(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Se connecter avec matricule (Portail Académique)
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw { status: 400, message: 'Refresh token manquant' };

    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', validate(z.object({ email: z.string().email() })), async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
