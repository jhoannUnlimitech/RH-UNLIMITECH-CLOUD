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
    secret: (() => {
      const secret = process.env.JWT_SECRET;
      if (!secret || secret.length < 32) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('FATAL: JWT_SECRET must be set and at least 32 characters in production');
        }
        // Solo en desarrollo: fallback seguro
        return 'rh-unlimitech-dev-only-jwt-secret-key-2026-not-for-production';
      }
      return secret;
    })(),
    expiresIn: '48h',
    cookieName: 'rh_auth_token',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 48 * 60 * 60 * 1000,
      path: '/',
    }
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  upload: {
    path: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  }
};
