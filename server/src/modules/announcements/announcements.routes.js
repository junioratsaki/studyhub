const express = require('express');
const router = express.Router();
const announcementsService = require('./announcements.service');
const auth = require('../../middlewares/auth');
const rbac = require('../../middlewares/rbac');

/**
 * Récupérer toutes les annonces (Public)
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await announcementsService.getAllAnnouncements();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * Créer une annonce (ADMIN uniquement)
 */
router.post('/', auth, rbac.requireRole("ADMIN"), async (req, res, next) => {
  try {
    const data = await announcementsService.createAnnouncement(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * Supprimer une annonce (ADMIN uniquement)
 */
router.delete('/:id', auth, rbac.requireRole("ADMIN"), async (req, res, next) => {
  try {
    const result = await announcementsService.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: "Annonce supprimée avec succès" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
