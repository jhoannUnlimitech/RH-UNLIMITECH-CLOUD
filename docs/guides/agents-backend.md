# Sistema de Gestión de RRHH - Backend (rh-management-system)

## Información del Proyecto

**Nombre**: rh-management-system  
**Versión**: 1.0.0  
**Ubicación Backend**: `/home/jeacosta37/RH-UNLIMITECH/backend`  
**Stack Tecnológico**:
- Node.js 20.x LTS
- Express 4.x
- MongoDB 7.x (Docker)
- Mongoose 8.x
- TypeScript 5.7.x
- JWT para autenticación
- Multer para uploads

---

## Tabla de Contenidos

1. [Arquitectura del Backend](#arquitectura-del-backend)
2. [Estructura de Directorios](#estructura-de-directorios)
3. [Modelos de Datos](#modelos-de-datos)
4. [API REST Endpoints](#api-rest-endpoints)
5. [Middleware](#middleware)
6. [Autenticación y Autorización](#autenticación-y-autorización)
7. [Configuración de MongoDB](#configuración-de-mongodb)
8. [Guía de Desarrollo](#guía-de-desarrollo)
9. [Comandos Útiles](#comandos-útiles)

---

## Arquitectura del Backend

### Visión General

El backend sigue una arquitectura REST API estándar con:

1. **Soft Delete**: Todos los modelos tienen soft delete (campo `deleted` y `deletedAt`)
2. **Timestamps**: Todos los modelos tienen `createdAt` y `updatedAt` automáticos
3. **HAL-UC Compliance**: Las respuestas siguen el contrato HAL-UC definido en `mobx_rules.yml`
4. **Modularidad**: Cada módulo (Employees, CSW, Training) tiene su propia estructura de routes/controllers/models

### Flujo de Peticiones

```
Cliente (Frontend)
       ↓
  CORS Middleware
       ↓
  Auth Middleware (JWT)
       ↓
  Express Router
       ↓
  Controller
       ↓
  Mongoose Model
       ↓
  MongoDB
       ↓
  Respuesta JSON (HAL-UC)
```

---

## Estructura de Directorios

```
backend/
├── src/
│   ├── config/                 # Configuraciones
│   │   ├── database.ts         # Conexión a MongoDB
│   │   ├── env.ts              # Variables de entorno
│   │   └── multer.ts           # Configuración de uploads
│   ├── middleware/             # Middlewares globales
│   │   ├── auth.ts             # Autenticación JWT
│   │   ├── error.ts            # Error handler
│   │   ├── softDelete.ts       # Soft delete middleware
│   │   └── cors.ts             # CORS config
│   ├── models/                 # Mongoose Schemas
│   │   ├── base/               # Esquemas base
│   │   │   └── BaseModel.ts    # Interfaz con timestamps y soft delete
│   │   ├── Employee.ts
│   │   ├── Division.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   ├── CSWRequest.ts
│   │   ├── Course.ts
│   │   ├── EmployeeCourse.ts
│   │   ├── StudyReport.ts
│   │   ├── Exam.ts
│   │   └── EmployeeExam.ts
│   ├── routes/                 # Express Routes
│   │   ├── index.ts            # Router agregador
│   │   ├── employees.ts
│   │   ├── csw.ts
│   │   └── training.ts
│   ├── controllers/            # Lógica de negocio
│   │   ├── employees.controller.ts
│   │   ├── csw.controller.ts
│   │   └── training.controller.ts
│   ├── services/               # Servicios reutilizables
│   │   ├── email.service.ts
│   │   └── upload.service.ts
│   ├── types/                  # TypeScript types
│   │   └── express.d.ts        # Extensiones de Express
│   ├── utils/                  # Utilidades
│   │   └── haluc.ts            # Helper para formato HAL-UC
│   ├── app.ts                  # Configuración de Express
│   └── server.ts               # Entry point
├── uploads/                    # Archivos subidos (fuera de src)
│   ├── photos/
│   └── documents/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Modelos de Datos

### BaseModel Interface

Todos los modelos extienden esta interfaz:

```typescript
// src/models/base/BaseModel.ts
import { Document } from 'mongoose';

export interface IBaseModel extends Document {
  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;
  deletedAt?: Date;
}

export const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      // No mostrar registros eliminados en respuestas normales
      if (ret.deleted) {
        return null;
      }
      return ret;
    }
  }
};
```

### Employee Model

```typescript
// src/models/Employee.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IEmployee extends IBaseModel {
  photo?: string; // Base64 o path
  name: string;
  email: string;
  password: string; // Hash bcrypt
  role: mongoose.Types.ObjectId; // Ref a Role
  division: mongoose.Types.ObjectId; // Ref a Division
  birthDate: Date;
  nationalId: string;
  phone: string;
  nationality: string;
  managerId?: mongoose.Types.ObjectId; // Ref a Employee
  
  // Soft delete
  deleted: boolean;
  deletedAt?: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  photo: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  division: { type: Schema.Types.ObjectId, ref: 'Division', required: true },
  birthDate: { type: Date, required: true },
  nationalId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  nationality: { type: String, required: true },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índices
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ nationalId: 1 });
EmployeeSchema.index({ deleted: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
```

### Division Model

```typescript
// src/models/Division.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IDivision extends IBaseModel {
  name: string; // "División 1", "División 2", etc.
  description?: string;
  managerId: mongoose.Types.ObjectId; // Responsable de división
  deleted: boolean;
  deletedAt?: Date;
}

const DivisionSchema = new Schema<IDivision>({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

export const Division = mongoose.model<IDivision>('Division', DivisionSchema);
```

### Role Model

```typescript
// src/models/Role.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IRole extends IBaseModel {
  name: string; // "AI DRIVEN DEVELOPER", "AI DRIVEN QA", etc.
  permissions: mongoose.Types.ObjectId[]; // Refs a Permission
  deleted: boolean;
  deletedAt?: Date;
}

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
```

### Permission Model

```typescript
// src/models/Permission.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IPermission extends IBaseModel {
  resource: string; // "employees", "csw", "training", etc.
  action: string; // "read", "create", "update", "delete", "approve"
  deleted: boolean;
  deletedAt?: Date;
}

const PermissionSchema = new Schema<IPermission>({
  resource: { type: String, required: true },
  action: { type: String, required: true },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índice compuesto para evitar duplicados
PermissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
```

### CSWRequest Model

```typescript
// src/models/CSWRequest.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IApproval {
  approverId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  date?: Date;
}

export interface ICSWRequest extends IBaseModel {
  from: {
    employeeId: mongoose.Types.ObjectId;
    requestDate: Date;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
  situation: string;
  information: string;
  solution: string;
  signature: string; // Nombre del solicitante
  approvals: IApproval[];
  status: 'pending' | 'approved' | 'rejected';
  deleted: boolean;
  deletedAt?: Date;
}

const ApprovalSchema = new Schema<IApproval>({
  approverId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  comment: { type: String },
  date: { type: Date }
}, { _id: false });

const CSWRequestSchema = new Schema<ICSWRequest>({
  from: {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    requestDate: { type: Date, default: Date.now }
  },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  situation: { type: String, required: true },
  information: { type: String, required: true },
  solution: { type: String, required: true },
  signature: { type: String, required: true },
  approvals: [ApprovalSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índices
CSWRequestSchema.index({ 'from.employeeId': 1 });
CSWRequestSchema.index({ status: 1 });

export const CSWRequest = mongoose.model<ICSWRequest>('CSWRequest', CSWRequestSchema);
```

### Course Model

```typescript
// src/models/Course.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface ICourse extends IBaseModel {
  title: string;
  description: string;
  type: 'link' | 'document';
  content: string; // URL o path del documento
  hasExam: boolean;
  examId?: mongoose.Types.ObjectId; // Ref a Exam
  deleted: boolean;
  deletedAt?: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['link', 'document'], required: true },
  content: { type: String, required: true },
  hasExam: { type: Boolean, default: false },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
```

### EmployeeCourse Model

```typescript
// src/models/EmployeeCourse.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IEmployeeCourse extends IBaseModel {
  employeeId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: 'in-progress' | 'completed' | 'failed';
  assignedDate: Date;
  lastReport: Date;
  historyPoints: number; // Acumulado en HP
  deleted: boolean;
  deletedAt?: Date;
}

const EmployeeCourseSchema = new Schema<IEmployeeCourse>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['in-progress', 'completed', 'failed'], default: 'in-progress' },
  assignedDate: { type: Date, default: Date.now },
  lastReport: { type: Date },
  historyPoints: { type: Number, default: 0 },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índice compuesto para evitar duplicados
EmployeeCourseSchema.index({ employeeId: 1, courseId: 1 }, { unique: true });

export const EmployeeCourse = mongoose.model<IEmployeeCourse>('EmployeeCourse', EmployeeCourseSchema);
```

### StudyReport Model

```typescript
// src/models/StudyReport.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IStudyReport extends IBaseModel {
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  type: 'curso-academia' | 'manejo-etica';
  hours: number; // En History Points (1 HP = 30 min)
  reference: string; // En qué referencia quedaste
  difficulties?: string;
  learnings?: string;
  deleted: boolean;
  deletedAt?: Date;
}

const StudyReportSchema = new Schema<IStudyReport>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true, default: Date.now },
  type: { type: String, enum: ['curso-academia', 'manejo-etica'], required: true },
  hours: { type: Number, required: true, min: 0 },
  reference: { type: String, required: true },
  difficulties: { type: String },
  learnings: { type: String },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índices
StudyReportSchema.index({ employeeId: 1, date: -1 });

export const StudyReport = mongoose.model<IStudyReport>('StudyReport', StudyReportSchema);
```

### Exam Model

```typescript
// src/models/Exam.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IQuestion {
  text: string;
  type: 'multiple-choice' | 'essay';
  options?: string[]; // Solo para multiple-choice
  correctAnswer?: number; // Índice de la respuesta correcta (solo para multiple-choice)
}

export interface IExam extends IBaseModel {
  courseId: mongoose.Types.ObjectId;
  title: string;
  questions: IQuestion[];
  deleted: boolean;
  deletedAt?: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'essay'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number }
}, { _id: false });

const ExamSchema = new Schema<IExam>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  questions: [QuestionSchema],
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
```

### EmployeeExam Model

```typescript
// src/models/EmployeeExam.ts
import mongoose, { Schema } from 'mongoose';
import { IBaseModel, baseSchemaOptions } from './base/BaseModel';

export interface IAnswer {
  questionIndex: number;
  answer: string | number; // String para essay, number para multiple-choice
}

export interface IEmployeeExam extends IBaseModel {
  employeeId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  status: 'pending' | 'submitted' | 'approved' | 'needs-correction';
  answers: IAnswer[];
  feedback?: string;
  grade?: number; // 0-100
  submittedAt?: Date;
  reviewedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  questionIndex: { type: Number, required: true },
  answer: { type: Schema.Types.Mixed, required: true }
}, { _id: false });

const EmployeeExamSchema = new Schema<IEmployeeExam>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { type: String, enum: ['pending', 'submitted', 'approved', 'needs-correction'], default: 'pending' },
  answers: [AnswerSchema],
  feedback: { type: String },
  grade: { type: Number, min: 0, max: 100 },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, baseSchemaOptions);

// Índice compuesto
EmployeeExamSchema.index({ employeeId: 1, examId: 1 }, { unique: true });

export const EmployeeExam = mongoose.model<IEmployeeExam>('EmployeeExam', EmployeeExamSchema);
```

---

## API REST Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Formato HAL-UC

Todas las respuestas siguen el formato HAL-UC:

```typescript
// src/utils/haluc.ts
export interface HALUCResponse<T = any> {
  _links: {
    self: { href: string };
    [key: string]: { href: string };
  };
  _embedded?: {
    [key: string]: T[];
  };
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export function createHALUCResponse<T>(
  data: T | T[],
  selfHref: string,
  links: Record<string, string> = {},
  meta?: any
): HALUCResponse<T> {
  const response: HALUCResponse<T> = {
    _links: {
      self: { href: selfHref },
      ...Object.entries(links).reduce((acc, [key, href]) => {
        acc[key] = { href };
        return acc;
      }, {} as Record<string, { href: string }>)
    }
  };

  if (Array.isArray(data)) {
    response._embedded = { items: data };
    if (meta) response.meta = meta;
  } else {
    response.data = data;
  }

  return response;
}
```

### Employees Endpoints

```
GET    /api/v1/employees           # Listar empleados (con filtros)
GET    /api/v1/employees/:id       # Obtener empleado por ID
POST   /api/v1/employees           # Crear empleado
PUT    /api/v1/employees/:id       # Actualizar empleado
DELETE /api/v1/employees/:id       # Soft delete empleado
POST   /api/v1/employees/:id/photo # Subir foto de empleado

GET    /api/v1/divisions           # Listar divisiones
POST   /api/v1/divisions           # Crear división
PUT    /api/v1/divisions/:id       # Actualizar división
DELETE /api/v1/divisions/:id       # Soft delete división

GET    /api/v1/roles               # Listar roles
POST   /api/v1/roles               # Crear rol
PUT    /api/v1/roles/:id           # Actualizar rol
DELETE /api/v1/roles/:id           # Soft delete rol

GET    /api/v1/permissions         # Listar permisos
POST   /api/v1/permissions         # Crear permiso
```

### CSW Endpoints

```
GET    /api/v1/csw                 # Listar solicitudes (según permisos del usuario)
GET    /api/v1/csw/:id             # Obtener solicitud por ID
POST   /api/v1/csw                 # Crear solicitud CSW
PUT    /api/v1/csw/:id             # Actualizar solicitud (solo si no tiene aprobaciones)
DELETE /api/v1/csw/:id             # Soft delete solicitud

POST   /api/v1/csw/:id/approve     # Aprobar solicitud (solo aprobador actual)
POST   /api/v1/csw/:id/reject      # Rechazar solicitud (solo aprobador actual)

GET    /api/v1/csw/my-requests     # Mis solicitudes enviadas
GET    /api/v1/csw/pending-approvals # Solicitudes pendientes de mi aprobación
```

### Training Endpoints

```
# Cursos
GET    /api/v1/training/courses                    # Listar cursos
GET    /api/v1/training/courses/:id                # Obtener curso por ID
POST   /api/v1/training/courses                    # Crear curso
PUT    /api/v1/training/courses/:id                # Actualizar curso
DELETE /api/v1/training/courses/:id                # Soft delete curso
POST   /api/v1/training/courses/:id/assign         # Asignar curso a empleado

# Reportes de Estudio
GET    /api/v1/training/study-reports              # Listar reportes (filtrados por empleado)
GET    /api/v1/training/study-reports/:id          # Obtener reporte por ID
POST   /api/v1/training/study-reports              # Crear reporte de estudio
DELETE /api/v1/training/study-reports/:id          # Soft delete reporte

# Exámenes
GET    /api/v1/training/exams                      # Listar exámenes
GET    /api/v1/training/exams/:id                  # Obtener examen por ID
POST   /api/v1/training/exams                      # Crear examen
PUT    /api/v1/training/exams/:id                  # Actualizar examen
DELETE /api/v1/training/exams/:id                  # Soft delete examen

GET    /api/v1/training/employee-exams             # Listar exámenes de empleado
GET    /api/v1/training/employee-exams/:id         # Obtener examen de empleado
POST   /api/v1/training/employee-exams             # Iniciar examen
PUT    /api/v1/training/employee-exams/:id/submit  # Enviar respuestas de examen
PUT    /api/v1/training/employee-exams/:id/review  # Revisar y calificar examen (Calidad)

# Estadísticas
GET    /api/v1/training/stats/weekly-hp            # History Points semanales
GET    /api/v1/training/stats/employees-in-progress # Empleados en cursos activos
```

---

## Middleware

### Auth Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const employee = await Employee.findById(decoded.id)
      .populate('role')
      .select('-password');
    
    if (!employee || employee.deleted) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: employee.id,
      email: employee.email,
      role: (employee.role as any).name
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Soft Delete Middleware

```typescript
// src/middleware/softDelete.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para filtrar automáticamente registros eliminados
 * Se aplica a todas las queries de Mongoose
 */
export const softDeleteMiddleware = (schema: any) => {
  // Filtrar en find, findOne, etc.
  schema.pre(/^find/, function(this: any, next: NextFunction) {
    if (!this.getOptions().includeDeleted) {
      this.where({ deleted: { $ne: true } });
    }
    next();
  });

  // Soft delete en lugar de hard delete
  schema.methods.softDelete = async function() {
    this.deleted = true;
    this.deletedAt = new Date();
    return await this.save();
  };

  // Método para restaurar
  schema.methods.restore = async function() {
    this.deleted = false;
    this.deletedAt = undefined;
    return await this.save();
  };
};
```

### Error Handler

```typescript
// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  console.error('ERROR:', err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
```

### CORS Middleware

```typescript
// src/middleware/cors.ts
import cors from 'cors';

export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);
```

---

## Autenticación y Autorización

### JWT Token

```typescript
// src/controllers/auth.controller.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/Employee';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const employee = await Employee.findOne({ email, deleted: false })
    .populate('role');

  if (!employee) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, employee.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: employee.id, email: employee.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: (employee.role as any).name
    }
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, ...rest } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await Employee.create({
    name,
    email,
    password: hashedPassword,
    ...rest
  });

  const token = jwt.sign(
    { id: employee.id, email: employee.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  res.status(201).json({
    token,
    employee: {
      id: employee.id,
      name: employee.name,
      email: employee.email
    }
  });
};
```

### Verificación de Permisos

```typescript
// src/middleware/permission.ts
import { AuthRequest } from './auth';
import { Response, NextFunction } from 'express';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';

export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = await Role.findOne({ name: req.user.role })
      .populate('permissions');

    if (!role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const hasPermission = (role.permissions as any[]).some(
      (perm: any) => perm.resource === resource && perm.action === action
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
};
```

---

## Configuración de MongoDB

### Conexión

```typescript
// src/config/database.ts
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/rh_management?authSource=admin';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
```

### Variables de Entorno

```bash
# .env.example
NODE_ENV=development
PORT=3000

# MongoDB
MONGO_URI=mongodb://admin:admin123@localhost:27017/rh_management?authSource=admin

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
FRONTEND_URL=http://localhost:5173

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

---

## Guía de Desarrollo

### Inicialización del Proyecto

```bash
# 1. Crear estructura de carpetas
mkdir -p src/{config,middleware,models/{base},routes,controllers,services,types,utils}
mkdir uploads/{photos,documents}

# 2. Inicializar npm
npm init -y

# 3. Instalar dependencias
npm install express mongoose cors dotenv bcrypt jsonwebtoken multer
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/multer ts-node-dev

# 4. Configurar TypeScript
npx tsc --init
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "seed": "ts-node src/scripts/seed.ts"
  }
}
```

### App Entry Point

```typescript
// src/app.ts
import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// Middlewares globales
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

export default app;
```

```typescript
// src/server.ts
import app from './app';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

### Seeding Initial Data

```typescript
// src/scripts/seed.ts
import { connectDB } from '../config/database';
import { Permission } from '../models/Permission';
import { Role } from '../models/Role';
import { Division } from '../models/Division';
import { Employee } from '../models/Employee';
import bcrypt from 'bcrypt';

const seed = async () => {
  await connectDB();

  // 1. Crear Permisos
  const permissions = await Permission.create([
    { resource: 'employees', action: 'read' },
    { resource: 'employees', action: 'create' },
    { resource: 'employees', action: 'update' },
    { resource: 'employees', action: 'delete' },
    { resource: 'csw', action: 'read' },
    { resource: 'csw', action: 'create' },
    { resource: 'csw', action: 'approve' },
    { resource: 'training', action: 'read' },
    { resource: 'training', action: 'create' },
    { resource: 'training', action: 'update' },
  ]);

  // 2. Crear Roles
  const adminRole = await Role.create({
    name: 'ARCHITECT SOLUTIONS',
    permissions: permissions.map(p => p._id)
  });

  const devRole = await Role.create({
    name: 'AI DRIVEN DEVELOPER',
    permissions: permissions.filter(p => 
      ['employees', 'csw', 'training'].includes(p.resource) && 
      ['read', 'create'].includes(p.action)
    ).map(p => p._id)
  });

  // 3. Crear Divisiones
  const division1 = await Division.create({
    name: 'División 1',
    description: 'Desarrollo Frontend',
    managerId: null // Se asignará después
  });

  // 4. Crear Usuario Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await Employee.create({
    name: 'Admin User',
    email: 'admin@rh.com',
    password: hashedPassword,
    role: adminRole._id,
    division: division1._id,
    birthDate: new Date('1990-01-01'),
    nationalId: '0000000000',
    phone: '+1234567890',
    nationality: 'Generic Country'
  });

  // Actualizar manager de división
  division1.managerId = admin._id;
  await division1.save();

  console.log('✅ Seed completed');
  console.log('📧 Admin email: admin@rh.com');
  console.log('🔑 Admin password: admin123');

  process.exit(0);
};

seed();
```

---

## Comandos Útiles

### Desarrollo

```bash
# Iniciar MongoDB con Docker Compose (desde el root del proyecto)
cd /home/jeacosta37/RH-UNLIMITECH
docker-compose up -d

# Verificar estado de MongoDB
docker-compose ps

# Ver logs de MongoDB
docker-compose logs -f mongodb

# Iniciar backend en modo dev
cd /home/jeacosta37/RH-UNLIMITECH/backend
npm run dev

# Ejecutar seed
npm run seed

# Build para producción
npm run build

# Iniciar producción
npm start
```

### Docker

```bash
# Detener MongoDB
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: elimina todos los datos)
docker-compose down -v

# Acceder a MongoDB CLI
docker exec -it rh-management-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Acceder a Mongo Express (UI)
# http://localhost:8081
```

### MongoDB CLI

```bash
# Conectarse a la base de datos
use rh_management

# Ver colecciones
show collections

# Ver empleados
db.employees.find().pretty()

# Ver solicitudes CSW
db.cswrequests.find().pretty()

# Limpiar colección (CUIDADO)
db.employees.deleteMany({})
```

---

## Próximos Pasos

### Fase 1: Inicialización (En Progreso)

1. ✅ Estructura de directorios backend/ creada
2. ✅ docker-compose.yml con MongoDB configurado
3. ✅ Documentación AGENTS-BACKEND.md creada
4. ⏳ **Inicializar npm y instalar dependencias**
5. ⏳ Crear modelos Mongoose
6. ⏳ Implementar routes y controllers básicos
7. ⏳ Crear seed para datos iniciales

### Fase 2: Integración con Frontend

1. Conectar stores Live de MobX con API
2. Implementar autenticación JWT en frontend
3. Manejo de errores y estados de carga
4. Testing end-to-end

---

## Soporte y Recursos

### Documentación Oficial

- **Express**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **MongoDB**: https://docs.mongodb.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **JWT**: https://jwt.io/

### Contacto

Para dudas o asistencia con el backend, consultar con el arquitecto de soluciones o el líder técnico del equipo.

---

**Última Actualización**: Enero 28, 2026  
**Versión del Documento**: 1.0.0  
**Autor**: AI Agent (GitHub Copilot con Claude Sonnet 4.5)
