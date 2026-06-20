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
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Redirect root to Swagger docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routers
const authRouter = require('./modules/auth/auth.routes');
const referentielRouter = require('./modules/referentiel/referentiel.routes');
const usersRouter = require('./modules/users/users.routes');
const subjectsRouter = require('./modules/subjects/subjects.routes');
const correctionsRouter = require('./modules/corrections/corrections.routes');
const aiRouter = require('./modules/ai/ai.routes');
const adminRouter = require('./modules/admin/admin.routes');
const announcementsRouter = require('./modules/announcements/announcements.routes');
const errorHandler = require('./middlewares/error');

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/referentiel', referentielRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/subjects', subjectsRouter);
app.use('/api/v1/corrections', correctionsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/announcements', announcementsRouter);

// Global Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

module.exports = app;
