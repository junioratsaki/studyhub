const { z } = require('zod');

/**
 * Middleware de validation de schéma avec Zod
 * @param {z.ZodSchema} schema - Le schéma de validation
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}

module.exports = { validate };
