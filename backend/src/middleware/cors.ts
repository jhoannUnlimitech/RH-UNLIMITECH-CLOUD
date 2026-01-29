import cors from 'cors';
import { config } from '../config/env';

/**
 * Configuración de CORS
 * Permite solicitudes desde el frontend con credenciales (cookies)
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como curl, Postman) o desde localhost
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else if (origin === config.frontend.url) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Permitir envío de cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // Cache preflight por 24 horas
};

export const corsMiddleware = cors(corsOptions);
