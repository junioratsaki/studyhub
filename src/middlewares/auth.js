const { verifyAccessToken } = require('../config/jwt');

/**
 * Middleware d'authentification JWT
 * Vérifie la présence et la validité du token Bearer
 */
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d'authentification manquant ou format invalide' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // On attache l'utilisateur décodé à la requête
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: error.message || 'Session expirée ou invalide' 
    });
  }
}

module.exports = auth;
