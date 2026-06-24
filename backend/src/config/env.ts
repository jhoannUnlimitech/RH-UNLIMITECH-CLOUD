import dotenv from 'dotenv';
import path from 'path';

// Cargar .env desde el directorio raíz del backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/rh_management',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'rh-unlimitech-jwt-secret-key-2026-super-secure-min-32-chars',
    expiresIn: '48h', // Token expira cada 48 horas
    cookieName: 'rh_auth_token',
    cookieOptions: {
      httpOnly: true, // No accesible via JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'lax' as const, // 'lax' permite cookies en Swagger/Postman, 'strict' las bloquea
      maxAge: 48 * 60 * 60 * 1000, // 48 horas en milisegundos
      path: '/',
    }
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  }
};
