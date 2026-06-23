const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Learning Management System',
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server (v1)',
      },
      {
        url: 'http://localhost:5000/api',
        description: 'Development server (Legacy)',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        ValidationError: {
          description: 'Validation failed for parameters, body, or upload size/type',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Validation Error' }
                }
              }
            }
          }
        },
        UnapprovedAccount: {
          description: 'Account is pending, suspended, or rejected',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Your account is pending admin approval. Please wait for an admin to approve your account.' }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Look for swagger JSDoc comments in these files
  apis: ['./src/routes/v1/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
