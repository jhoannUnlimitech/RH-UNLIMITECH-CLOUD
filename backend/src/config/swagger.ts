import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Gestión de RRHH - API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión de recursos humanos con autenticación JWT en cookies',
      contact: {
        name: 'RH UNLIMITECH',
        email: 'admin@rh.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'rh_auth_token',
          description: `JWT almacenado en cookie httpOnly (48h de expiración).

**PASO 1: AUTENTICARSE**
- Ejecuta POST /api/v1/auth/login con tu email y password
- La cookie se establecerá automáticamente en tu navegador
- Credenciales de prueba: admin@rh.com / admin123

**PASO 2: USAR ENDPOINTS PROTEGIDOS**
- Todos los endpoints subsecuentes usarán automáticamente esta cookie
- No necesitas hacer nada más, la cookie se incluye automáticamente
- La sesión dura 48 horas

**DEBUG**
- Si necesitas ver el token: GET /api/v1/auth/debug/token
- Para cerrar sesión: POST /api/v1/auth/logout`
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: `Token JWT en header Authorization (alternativa para Swagger).

**PASO 1: OBTENER TOKEN**
1. Ejecuta POST /api/v1/auth/login
2. Copia el token de la respuesta (campo data.debug.token)

**PASO 2: AUTORIZAR**
1. Click en el botón "Authorize" 🔓
2. Pega el token (sin 'Bearer', solo el token)
3. Click "Authorize"

**PASO 3: USAR ENDPOINTS**
- Ahora todos los endpoints incluirán: Authorization: Bearer <token>
- El token dura 48 horas

**NOTA**: Este método es solo para testing en Swagger. En producción, usa cookieAuth.`
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Descripción del error'
            }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011'
            },
            name: {
              type: 'string',
              example: 'Jordan Blake'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'jordan.blake@rh.com'
            },
            role: {
              type: 'string',
              example: 'AI DRIVEN DEVELOPER'
            },
            division: {
              type: 'string',
              example: 'División 1'
            },
            photo: {
              type: 'string',
              description: 'Foto en formato base64',
              example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
            },
            birthDate: {
              type: 'string',
              format: 'date',
              example: '1992-06-20'
            },
            nationalId: {
              type: 'string',
              example: '1234567890'
            },
            phone: {
              type: 'string',
              example: '+1234567890'
            },
            nationality: {
              type: 'string',
              example: 'Generic Country'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación y gestión de sesión'
      },
      {
        name: 'Employees',
        description: 'Gestión de empleados'
      },
      {
        name: 'CSW',
        description: 'Change Management - Sistema de gestión de cambios y aprobaciones'
      },
      {
        name: 'Training',
        description: 'Gestión de capacitaciones y cursos'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
