const express = require('express');
const router = express.Router();
const adminService = require('./admin.service');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate');

// Appliquer les protections ADMIN sur toutes les routes du module
router.use(auth, rbac.requireRole('ADMIN'));

/**
 * Liste des utilisateurs avec filtres
 */
router.get('/users', async (req, res, next) => {
  try {
    const { page, role, search } = req.query;
    const result = await adminService.getUsers({
      page: parseInt(page) || 1,
      role,
      search
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Bloquer ou débloquer un utilisateur
 */
router.patch('/users/:id/block', validate(z.object({ block: z.boolean() })), async (req, res, next) => {
  try {
    const result = await adminService.blockUser(req.params.id, req.body.block);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Supprimer un compte utilisateur
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (err) {
    next(err);
  }
});

/**
 * Générer un code d'invitation pour enseignant
 */
router.post('/codes', async (req, res, next) => {
  try {
    const result = await adminService.generateCode(req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Statistiques globales
 */
router.get('/stats', async (req, res, next) => {
  try {
    const result = await adminService.getStats();
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Journal d'audit
 */
router.get('/logs', async (req, res, next) => {
  try {
    const { level, page } = req.query;
    const result = await adminService.getLogs({
      level,
      page: parseInt(page) || 1
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * Créer une annonce globale
 */
router.post('/announcements', validate(z.object({ 
  title: z.string().min(3), 
  content: z.string().min(10) 
})), async (req, res, next) => {
  try {
    const result = await adminService.createAnnouncement({
      ...req.body,
      adminId: req.user.id
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
