import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Notification — Notificaciones del sistema para empleados.
 *
 * Se crean automáticamente cuando ocurren eventos relevantes:
 * - Asignación de curso/examen
 * - Aprobación/rechazo de CSW
 * - Cambios en el progreso de training
 * - Asignaciones extraordinarias
 *
 * El empleado las ve en el dropdown del header (bell icon).
 */

export type NotificationType = 
  | 'course_assigned'
  | 'exam_assigned'
  | 'exam_graded'
  | 'level_unlocked'
  | 'badge_earned'
  | 'assignment_new'
  | 'csw_approved'
  | 'csw_rejected'
  | 'general';

export interface INotification extends Document {
  recipient: Types.ObjectId;       // ref: Employee (quien recibe)
  type: NotificationType;
  title: string;
  message: string;
  link?: string;                   // URL a donde navegar al hacer click
  read: boolean;
  readAt?: Date;
  metadata?: Record<string, any>; // Datos extra (courseId, examId, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El destinatario es requerido'],
    index: true,
  },
  type: {
    type: String,
    enum: ['course_assigned', 'exam_assigned', 'exam_graded', 'level_unlocked', 'badge_earned', 'assignment_new', 'csw_approved', 'csw_rejected', 'general'],
    required: [true, 'El tipo es requerido'],
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: 200,
  },
  message: {
    type: String,
    required: [true, 'El mensaje es requerido'],
    trim: true,
    maxlength: 500,
  },
  link: {
    type: String,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      delete ret.__v;
      return ret;
    }
  }
});

// --- Índices ---
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // TTL: 90 días

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
