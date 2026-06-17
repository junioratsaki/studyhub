const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyHub API',
      version: '1.0.0',
      description: "Documentation de l'API StudyHub",
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
  apis: [path.join(__dirname, '../src/modules/**/*.routes.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
fs.writeFileSync(path.join(__dirname, '../../swagger.json'), JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger definition generated at ./swagger.json');
