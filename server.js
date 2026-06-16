const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 StudyHub Backend démarré sur le port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});
