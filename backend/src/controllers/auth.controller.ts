import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';
import { AppError } from '../middleware/error';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';

/**
 * Genera un JWT y lo almacena en cookie httpOnly
 * El payload incluye información esencial para autorización:
 * - id: Identificador único del empleado
 * - email: Para auditoría y tracking
 * - roleId: Para decisiones rápidas de autorización
 * - divisionId: Para filtros y permisos por división
 */
const generateTokenAndSetCookie = async (res: Response, employeeId: string): Promise<string> => {
  // Obtener información esencial del empleado
  const employee = await Employee.findById(employeeId)
    .select('email role division')
    .lean();

  if (!employee) {
    throw new AppError('Empleado no encontrado', 404);
  }

  // Payload con información esencial e inmutable
  const payload = {
    id: employeeId,
    email: employee.email,
    roleId: employee.role.toString(),
    divisionId: employee.division.toString(),
    iat: Math.floor(Date.now() / 1000) // Timestamp de emisión
  };

  const token = jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } // 48 horas
  );

  // Establecer cookie httpOnly con el token
  res.cookie(config.jwt.cookieName, token, config.jwt.cookieOptions);

  return token;
};

/**
 * Registro de nuevo empleado
 * POST /api/v1/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      division, 
      birthDate, 
      nationalId, 
      phone, 
      nationality,
      photo,
      managerId 
    } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password || !role || !division || !birthDate || !nationalId || !phone || !nationality) {
      throw new AppError('Todos los campos son requeridos', 400);
    }

    // Verificar si el email ya existe
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Crear empleado
    const employee = await Employee.create({
      name,
      email,
      password, // Se hasheará automáticamente en el pre-save hook
      role,
      division,
      birthDate,
      nationalId,
      phone,
      nationality,
      photo,
      managerId
    });

    // Cargar relaciones
    await employee.populate('role', 'name');
    await employee.populate('division', 'name');

    // Generar token y establecer cookie
    await generateTokenAndSetCookie(res, employee.id);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: (employee.role as any).name,
          division: (employee.division as any).name,
          photo: employee.photo
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de empleado
 * POST /api/v1/auth/login
 * Si el usuario ya tiene una sesión activa, el token se reemplaza
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    // Buscar empleado (incluir password que está en select: false)
    const employee = await Employee.findOne({ email })
      .select('+password')
      .populate('role', 'name')
      .populate('division', 'name');

    if (!employee) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await employee.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar nuevo token y reemplazar cookie existente
    // Si ya había un token, este será reemplazado automáticamente
    const token = await generateTokenAndSetCookie(res, employee.id);

    // Log en desarrollo para debugging
    if (config.env === 'development') {
      console.log('✅ Cookie establecida:', config.jwt.cookieName);
      console.log('📧 Usuario autenticado:', employee.email);
    }

    // Decodificar token para obtener información de expiración
    const decoded = jwt.decode(token) as any;

    // Obtener permisos populados
    const employeeWithPerms = await Employee.findById(employee.id)
      .populate({
        path: 'role',
        populate: { path: 'permissions', select: 'resource action' }
      })
      .select('-password');

    const response: any = {
      status: 'success',
      message: 'Login exitoso',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: (employee.role as any).name,
          division: (employee.division as any).name,
          photo: employee.photo,
          permissions: (employeeWithPerms?.role as any)?.permissions || []
        },
        session: {
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          expiresIn: config.jwt.expiresIn,
          cookieName: config.jwt.cookieName
        }
      }
    };

    // En desarrollo, incluir el token para pruebas
    if (config.env === 'development') {
      response.data.debug = {
        token,
        note: 'Token también está en cookie httpOnly: ' + config.jwt.cookieName
      };
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout de empleado
 * POST /api/v1/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Limpiar cookie
    res.clearCookie(config.jwt.cookieName, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      status: 'success',
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener usuario actual (basado en cookie)
 * GET /api/v1/auth/me
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('No autenticado', 401);
    }

    const employee = await Employee.findById(req.user.id)
      .populate('role', 'name')
      .populate('division', 'name')
      .populate('managerId', 'name email');

    if (!employee) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      status: 'success',
      data: {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: (employee.role as any).name,
          division: (employee.division as any).name,
          birthDate: employee.birthDate,
          nationalId: employee.nationalId,
          phone: employee.phone,
          nationality: employee.nationality,
          photo: employee.photo,
          manager: employee.managerId ? {
            id: (employee.managerId as any).id,
            name: (employee.managerId as any).name,
            email: (employee.managerId as any).email
          } : null,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refrescar token (extender sesión)
 * POST /api/v1/auth/refresh
 */
export const refreshToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('No autenticado', 401);
    }

    // Generar nuevo token con nueva fecha de expiración
    const token = await generateTokenAndSetCookie(res, req.user.id);
    const decoded = jwt.decode(token) as any;

    const response: any = {
      status: 'success',
      message: 'Token renovado exitosamente',
      data: {
        session: {
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          expiresIn: config.jwt.expiresIn
        }
      }
    };

    // En desarrollo, incluir el nuevo token
    if (config.env === 'development') {
      response.data.debug = { token };
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Debug: Inspeccionar token actual
 * GET /api/v1/auth/debug/token
 * Solo disponible en desarrollo
 */
export const debugToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (config.env !== 'development') {
      throw new AppError('Endpoint solo disponible en desarrollo', 403);
    }

    // Obtener token de la cookie
    const token = req.cookies[config.jwt.cookieName];

    if (!token) {
      throw new AppError('No hay token en la cookie', 401);
    }

    // Decodificar sin verificar (para ver contenido incluso si expiró)
    const decoded = jwt.decode(token, { complete: true });

    // Verificar token
    let verified = null;
    let isValid = false;
    try {
      verified = jwt.verify(token, config.jwt.secret);
      isValid = true;
    } catch (error: any) {
      verified = { error: error.message };
    }

    // Información del usuario autenticado
    let userData = null;
    if (req.user) {
      const employee = await Employee.findById(req.user.id)
        .populate({
          path: 'role',
          populate: { path: 'permissions', select: 'resource action' }
        })
        .select('-password');
      
      userData = {
        id: employee?.id,
        name: employee?.name,
        email: employee?.email,
        role: (employee?.role as any)?.name,
        permissions: (employee?.role as any)?.permissions || []
      };
    }

    res.json({
      status: 'success',
      data: {
        token: {
          raw: token,
          decoded,
          verified,
          isValid
        },
        cookie: {
          name: config.jwt.cookieName,
          options: config.jwt.cookieOptions
        },
        user: userData,
        timestamps: {
          issued: decoded ? new Date((decoded as any).payload.iat * 1000).toISOString() : null,
          expires: decoded ? new Date((decoded as any).payload.exp * 1000).toISOString() : null,
          now: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
