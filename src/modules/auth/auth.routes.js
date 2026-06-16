const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// --- SCHÉMAS DE VALIDATION ZOD ---

const registerSchema = z.object({
  nom: z.string().min(2, 'Le nom est trop court'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  role: z.enum(['ETUDIANT', 'ENSEIGNANT', 'ADMIN']),
  filiere_id: z.string().uuid('ID de filière invalide').optional(),
  code: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit faire au moins 8 caractères'),
});

// --- HANDLERS ---

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

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

router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
