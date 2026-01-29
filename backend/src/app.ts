import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { swaggerAuthMiddleware } from './middleware/swaggerAuth';
import routes from './routes';

const app: Application = express();

// Middlewares globales
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' })); // Aumentado para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Para leer cookies con JWT

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// Swagger API Documentation
// CRÍTICO: withCredentials debe estar FUERA de swaggerOptions
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RH Management API',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    withCredentials: true // Habilitar envío de cookies
  }
}));

// Middleware de autenticación para Swagger (soporte Basic Auth)
app.use('/api/v1', swaggerAuthMiddleware);

// API Routes
app.use('/api/v1', routes);

// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejador global de errores (debe ir al final)
app.use(errorHandler);

export default app;
