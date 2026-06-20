const express = require('express');
const router = express.Router();
const referentielService = require('./referentiel.service');

// Route publique pour obtenir tout le référentiel (nécessaire pour l'inscription)
router.get('/', async (req, res, next) => {
  try {
    const data = await referentielService.getAllReferentiel();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Route pour obtenir les filières d'une école spécifique
router.get('/filieres/:ecoleId', async (req, res, next) => {
  try {
    const data = await referentielService.getFilieresByEcole(req.params.ecoleId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
