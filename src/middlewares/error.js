/**
 * Gestionnaire d'erreurs global d'Express
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.stack}`);

  const status = err.status || 500;
  const message = err.message || 'Une erreur interne est survenue';

  res.status(status).json({
    success: false,
    message: message,
    // On n'affiche la stack trace qu'en mode développement
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorHandler;
