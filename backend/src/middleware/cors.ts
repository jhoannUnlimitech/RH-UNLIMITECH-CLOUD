import cors from 'cors';
import { config } from '../config/env';

/**
 * Configuración de CORS
 * Permite solicitudes desde el frontend con credenciales (cookies)
 */
export const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', config.frontend.url],
  credentials: true, // Permitir envío de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // Cache preflight por 24 horas
};

export const corsMiddleware = cors(corsOptions);
