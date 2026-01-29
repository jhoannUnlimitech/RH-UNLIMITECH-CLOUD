import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe,
  refreshToken,
  debugToken
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo empleado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *               - division
 *               - birthDate
 *               - nationalId
 *               - phone
 *               - nationality
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jordan Blake
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jordan.blake@rh.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: dev123
 *               role:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               division:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: 1992-06-20
 *               nationalId:
 *                 type: string
 *                 example: 1234567890
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               nationality:
 *                 type: string
 *                 example: Generic Country
 *               photo:
 *                 type: string
 *                 description: Foto en base64
 *                 example: data:image/jpeg;base64,/9j/4AAQSkZJRg...
 *               managerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: rh_auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Email ya registrado
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y establecer cookie de autenticación
 *     description: |
 *       **⚡ IMPORTANTE: Ejecuta este endpoint PRIMERO para autenticarte en Swagger**
 *       
 *       Este endpoint autentica al usuario y establece una cookie httpOnly que será
 *       usada automáticamente en todos los endpoints subsecuentes.
 *       
 *       **📋 Pasos para usar Swagger:**
 *       1. ▶️ Ejecuta este endpoint (POST /api/v1/auth/login) con tu email y password
 *       2. ✅ Si es exitoso, la cookie se establecerá automáticamente
 *       3. 🔓 Ahora puedes ejecutar cualquier otro endpoint (la cookie se envía automáticamente)
 *       4. 🔍 Para ver tu token actual: GET /api/v1/auth/debug/token
 *       
 *       **🔑 Credenciales de prueba:**
 *       - Email: admin@rh.com
 *       - Password: admin123
 *       
 *       El token dura 48 horas y se renueva automáticamente en cada login.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@rh.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: rh_auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; Secure; SameSite=Strict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No autenticado
 */
router.post('/logout', authMiddleware, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       $ref: '#/components/schemas/Employee'
 *       401:
 *         description: No autenticado
 */
router.get('/me', authMiddleware, getMe);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refrescar token (extender sesión)
 *     description: Genera un nuevo token JWT con 48h adicionales de expiración
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *       401:
 *         description: No autenticado
 */
router.post('/refresh', authMiddleware, refreshToken);

/**
 * @swagger
 * /auth/debug/token:
 *   get:
 *     summary: Inspeccionar token JWT actual (solo desarrollo)
 *     tags: [Auth]
 *     description: Retorna información detallada del token JWT almacenado en la cookie
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Información del token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: object
 *                       properties:
 *                         raw:
 *                           type: string
 *                         decoded:
 *                           type: object
 *                         verified:
 *                           type: object
 *                         isValid:
 *                           type: boolean
 *                     user:
 *                       type: object
 *                     timestamps:
 *                       type: object
 *       403:
 *         description: Solo disponible en desarrollo
 */
router.get('/debug/token', authMiddleware, debugToken);

export default router;
