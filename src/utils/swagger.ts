// src/utils/swagger.ts
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'LYSEONGH API', version: '1.0.0' },
  paths: {
    '/api/contact': {
      post: {
        summary: 'Submit contact form',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string', nullable: true },
                  message: { type: 'string' },
                  recaptchaToken: { type: 'string' },
                },
                required: ['name', 'email', 'message', 'recaptchaToken'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Message submitted successfully' },
          '400': { description: 'Invalid input or reCAPTCHA failed' },
          '500': { description: 'Internal server error' },
        },
      },
      get: {
        summary: 'Get contact messages (Admin only)',
        responses: {
          '200': { description: 'List of messages' },
          '403': { description: 'Forbidden' },
          '500': { description: 'Internal server error' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};