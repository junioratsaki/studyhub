const multer = require('multer');

// Configuration du stockage en mémoire pour envoyer ensuite vers Supabase Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF et Images (JPG, PNG) sont acceptés.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Limite à 20 MB
  },
  fileFilter: fileFilter,
});

// Export des fonctions d'upload
const uploadSingle = upload.single('file');
const uploadOptional = upload.single('file'); // Même logique, mais utilisé pour les corrections

module.exports = {
  uploadSingle,
  uploadOptional,
};
