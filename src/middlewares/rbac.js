/**
 * Middleware de contrôle d'accès basé sur les rôles (RBAC)
 * @param {...string} roles - Liste des rôles autorisés (ex: "ADMIN', "ENSEIGNANT')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non authentifié' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès refusé. Ce rôle (${req.user.role}) n'est pas autorisé à effectuer cette action.` 
      });
    }

    next();
  };
}

module.exports = { requireRole };
