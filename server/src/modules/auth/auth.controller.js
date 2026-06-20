const express = require('express');
const router = express.Router();
const authService = require('./auth.service');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// Schémas de validation mis à jour pour l'ERP
router.post('/register', validate(z.object({
  nom: z.string().min(2),
  matricule: z.string().min(3), // Obligatoire
  email: z.string().email().optional().or(z.literal('')), 
  password: z.string().min(8),
  role: z.enum(['ETUDIANT', 'ENSEIGNANT', 'ADMIN']),
  filiere_id: z.string().uuid().optional(),
  code: z.string().optional(),
})), async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(z.object({
  matricule: z.string().min(1), // Connexion par matricule
  password: z.string().min(1),
})), async (req, res, next) => {
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

router.post('/reset-password', validate(z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
})), async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
