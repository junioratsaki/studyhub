const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 StudyHub Backend démarré sur le port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});

// Gestionnaires d'erreurs pour une fermeture propre
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});
