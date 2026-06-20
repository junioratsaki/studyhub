const express = require('express');
const router = express.Router();
const usersService = require('./users.service');
const auth = require('../../middlewares/auth');
const { upload } = require('../../middlewares/upload');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// --- SCHÉMAS DE VALIDATION ---

const updateProfileSchema = z.object({
  nom: z.string().min(2).optional(),
  filiere_id: z.string().uuid().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit faire au moins 8 caractères'),
});

// --- ROUTES ---

// Mon profil (Version ERP avec jointures)
router.get('/me', auth, async (req, res, next) => {
  try {
    const profile = await usersService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// Modifier profil
router.patch('/me', auth, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const profile = await usersService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// Route pour l'avatar (Photo de profil)
router.patch('/me/avatar', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) throw { status: 400, message: 'Aucun fichier envoyé' };

    // On suppose que le middleware 'upload' ajoute 'location' ou 'publicUrl' à req.file
    const avatarUrl = req.file.location || req.file.publicUrl;

    await usersService.updateAvatar(req.user.id, avatarUrl);
    res.json({ success: true, data: { avatar_url: avatarUrl } });
  } catch (err) {
    next(err);
  }
});

// Changer mot de passe
router.patch('/me/password', auth, validate(changePasswordSchema), async (req, res, next) => {
  try {
    const result = await usersService.changePassword(req.user.id, req.body);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

// Historique de lecture
router.get('/me/history', auth, async (req, res, next) => {
  try {
    const { page } = req.query;
    const history = await usersService.getHistory(req.user.id, { page: parseInt(page) || 1 });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// Mes favoris
router.get('/me/favorites', auth, async (req, res, next) => {
  try {
    const favorites = await usersService.getFavorites(req.user.id);
    res.json({ success: true, data: favorites });
  } catch (err) {
    next(err);
  }
});

// Ajouter un favori
router.post('/me/favorites/:id', auth, async (req, res, next) => {
  try {
    const result = await usersService.addFavorite(req.user.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Retirer un favori
router.delete('/me/favorites/:id', auth, async (req, res, next) => {
  try {
    const result = await usersService.removeFavorite(req.user.id, req.params.id);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
