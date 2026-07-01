import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/error';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { swaggerAuthMiddleware } from './middleware/swaggerAuth';
import routes from './routes';

const app: Application = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? undefined : false, // Desactivar CSP en dev (Swagger)
  crossOriginEmbedderPolicy: false, // Necesario para cargar imágenes externas
}));

// Compression
app.use(compression());

// ─── Rate Limiting ──────────────────────────────────────────────────────────
// En development: límites más altos para permitir e2e tests sin interrupciones.
// En production: límites estrictos para proteger contra abuse.
// Ventana de 5 minutos en dev (recuperación rápida), 15 minutos en prod.

const isDev = process.env.NODE_ENV === 'development';

// Global: protege todos los endpoints contra DDoS/abuse
const globalLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 15 * 60 * 1000,  // 5 min dev, 15 min prod
  max: isDev ? 1000 : 500,                             // 1000 dev, 500 prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas solicitudes. Intente más tarde.' },
});
app.use(globalLimiter);

// Auth: protege login contra brute-force
const authLimiter = rateLimit({
  windowMs: isDev ? 5 * 60 * 1000 : 15 * 60 * 1000,  // 5 min dev, 15 min prod
  max: isDev ? 50 : 10,                                // 50 dev, 10 prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de inicio de sesión. Intente en 15 minutos.' },
});
app.use('/api/v1/auth/login', authLimiter);

// Middlewares globales
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: process.uptime(),
  });
});

// Swagger API Documentation (solo en desarrollo)
if (config.env !== 'production') {
  // CRÍTICO: withCredentials debe estar FUERA de swaggerOptions
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RH Management API',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      withCredentials: true
    }
  }));
}

// Middleware de autenticación para Swagger (soporte Basic Auth)
app.use('/api/v1', swaggerAuthMiddleware);

// API Routes
app.use('/api/v1', routes);

// Manejador de rutas no encontradas
app.use(notFoundHandler);

// Manejador global de errores (debe ir al final)
app.use(errorHandler);

export default app;
