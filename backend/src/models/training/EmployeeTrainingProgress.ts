import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * EmployeeTrainingProgress — Progreso de capacitación de un empleado.
 *
 * Relación 1:1 con Employee. Se crea automáticamente al crear un empleado (D21).
 * Campo active=false cuando el empleado está inactivo/suspendido (D22).
 * Contiene el estado de cada curso, nivel e insignia como subdocumentos embebidos.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type CourseStatus = 'not_started' | 'in_progress' | 'completed';
export type LevelStatus = 'locked' | 'in_progress' | 'exam_pending' | 'exam_failed' | 'completed';
export type BadgeStatus = 'not_started' | 'in_progress' | 'completed';

// ─── Sub-documents ──────────────────────────────────────────────────────────

export interface ICourseProgress {
  course: Types.ObjectId;          // ref: Course
  status: CourseStatus;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ILevelProgress {
  level: Types.ObjectId;           // ref: Level
  status: LevelStatus;
  startedAt?: Date;
  completedAt?: Date;
  examAttempts: number;            // Intentos de examen realizados
}

export interface IBadgeProgress {
  badge: Types.ObjectId;           // ref: Badge
  status: BadgeStatus;
  percentage: number;              // 0-100 progreso
  startedAt?: Date;
  earnedAt?: Date;
}

// ─── Schemas de subdocumentos ───────────────────────────────────────────────

const CourseProgressSchema = new Schema<ICourseProgress>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  startedAt: { type: Date },
  completedAt: { type: Date },
}, { _id: false });

const LevelProgressSchema = new Schema<ILevelProgress>({
  level: { type: Schema.Types.ObjectId, ref: 'Level', required: true },
  status: { type: String, enum: ['locked', 'in_progress', 'exam_pending', 'exam_failed', 'completed'], default: 'locked' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  examAttempts: { type: Number, default: 0 },
}, { _id: false });

const BadgeProgressSchema = new Schema<IBadgeProgress>({
  badge: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  startedAt: { type: Date },
  earnedAt: { type: Date },
}, { _id: false });

// ─── Documento principal ────────────────────────────────────────────────────

export interface IEmployeeTrainingProgress extends Document {
  employee: Types.ObjectId;        // ref: Employee (1:1, unique)
  courses: ICourseProgress[];
  levels: ILevelProgress[];
  badges: IBadgeProgress[];
  latestBadge?: Types.ObjectId;    // ref: Badge (última insignia obtenida)
  totalStudyHours: number;
  currentLevel?: Types.ObjectId;   // ref: Level (nivel actual en progreso)
  currentCourse?: Types.ObjectId;  // ref: Course (curso actual)
  active: boolean;                 // D22: false si empleado inactivo
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeTrainingProgressSchema = new Schema<IEmployeeTrainingProgress>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El empleado es requerido'],
    unique: true,
    index: true,
  },
  courses: {
    type: [CourseProgressSchema],
    default: [],
  },
  levels: {
    type: [LevelProgressSchema],
    default: [],
  },
  badges: {
    type: [BadgeProgressSchema],
    default: [],
  },
  latestBadge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
  },
  totalStudyHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  currentLevel: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
  },
  currentCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
EmployeeTrainingProgressSchema.index({ active: 1, 'badges.status': 1 });

export const EmployeeTrainingProgress = mongoose.model<IEmployeeTrainingProgress>(
  'EmployeeTrainingProgress',
  EmployeeTrainingProgressSchema
);
