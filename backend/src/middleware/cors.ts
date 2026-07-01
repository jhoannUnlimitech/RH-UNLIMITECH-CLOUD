import cors from 'cors';
import { config } from '../config/env';

/**
 * Configuración de CORS
 * En producción: solo el frontend configurado
 * En desarrollo: localhost permitido para Vite dev server
 */
const allowedOrigins = config.env === 'production'
  ? [config.frontend.url]
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', config.frontend.url];

export const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400
};

export const corsMiddleware = cors(corsOptions);
