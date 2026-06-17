const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

// --- CONFIGURATION SWAGGER ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyHub API',
      version: '1.0.0',
      description: "Documentation de l'API StudyHub - Plateforme d'aide aux étudiants",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Serveur Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.js'], // Chemin vers les fichiers de routes pour extraire la doc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Global Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour permettre à Swagger UI de s'afficher correctement
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routers
const authRouter = require('./modules/auth/auth.routes');
const usersRouter = require('./modules/users/users.routes');
const subjectsRouter = require('./modules/subjects/subjects.routes');
const correctionsRouter = require('./modules/corrections/corrections.routes');
const aiRouter = require('./modules/ai/ai.routes');
const adminRouter = require('./modules/admin/admin.routes');
const errorHandler = require('./middlewares/error');

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/subjects', subjectsRouter);
app.use('/api/v1/corrections', correctionsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/admin', adminRouter);

// Global Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

module.exports = app;
