import mongoose, { Schema, Document, Types } from 'mongoose';
import { softDeletePlugin } from '../base/BaseModel';

/**
 * Exam — Examen asociado a un nivel de capacitación.
 *
 * Cada nivel puede tener un examen. Las preguntas están embebidas como subdocumentos.
 * Tipos de pregunta: multiple_choice (auto-evaluable) y open_text (evaluación manual).
 * Sin tiempo límite (D6). maxAttempts default 1 (D5).
 */

// ─── Sub-document: Opciones de multiple_choice ──────────────────────────────

export interface IExamOption {
  text: string;
  isCorrect: boolean;
}

const ExamOptionSchema = new Schema<IExamOption>({
  text: {
    type: String,
    required: [true, 'El texto de la opción es requerido'],
    trim: true,
    maxlength: [500, 'El texto de la opción no puede exceder 500 caracteres']
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false });

// ─── Sub-document: Pregunta del examen ──────────────────────────────────────

export type QuestionType = 'multiple_choice' | 'open_text';

export interface IExamQuestion {
  question: string;
  type: QuestionType;
  options?: IExamOption[];          // Solo para multiple_choice
  expectedAnswer?: string;          // Guía para evaluador en open_text (D7)
  points: number;                   // Puntos de la pregunta
  order: number;                    // Orden de la pregunta
}

const ExamQuestionSchema = new Schema<IExamQuestion>({
  question: {
    type: String,
    required: [true, 'El enunciado de la pregunta es requerido'],
    trim: true,
    maxlength: [2000, 'La pregunta no puede exceder 2000 caracteres']
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'open_text'],
    required: [true, 'El tipo de pregunta es requerido']
  },
  options: {
    type: [ExamOptionSchema],
    default: undefined, // No incluir si no es multiple_choice
    validate: {
      validator: function(this: IExamQuestion, options: IExamOption[]) {
        if (this.type === 'multiple_choice') {
          if (!options || options.length < 2) return false;
          const correctCount = options.filter(o => o.isCorrect).length;
          return correctCount === 1; // Exactamente 1 correcta
        }
        return true;
      },
      message: 'Las preguntas de selección múltiple requieren al menos 2 opciones con exactamente 1 correcta'
    }
  },
  expectedAnswer: {
    type: String,
    trim: true,
    maxlength: [2000, 'La respuesta esperada no puede exceder 2000 caracteres']
  },
  points: {
    type: Number,
    required: [true, 'Los puntos son requeridos'],
    min: [1, 'Los puntos mínimos son 1'],
    max: [100, 'Los puntos máximos son 100'],
    default: 10
  },
  order: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

// ─── Documento principal: Exam ──────────────────────────────────────────────

export interface IExam extends Document {
  title: string;
  description?: string;
  level: Types.ObjectId;            // ref: Level
  questions: IExamQuestion[];
  passingScore: number;             // Puntaje mínimo para aprobar (%)
  maxAttempts: number;              // Intentos máximos (D5: default 1)
  assignedTo?: Types.ObjectId[];    // ref: Employee[] (asignación a empleados específicos, D4)
  active: boolean;
  createdBy: Types.ObjectId;        // ref: Employee (quien creó el examen)

  // Soft delete
  deleted: boolean;
  deletedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  totalPoints: number;
  questionCount: number;

  // Métodos
  softDelete(): Promise<this>;
  restore(): Promise<this>;
}

const ExamSchema = new Schema<IExam>({
  title: {
    type: String,
    required: [true, 'El título del examen es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
    required: [true, 'El nivel es requerido'],
    index: true
  },
  questions: {
    type: [ExamQuestionSchema],
    required: true,
    validate: {
      validator: (questions: IExamQuestion[]) => questions.length >= 1,
      message: 'El examen debe tener al menos 1 pregunta'
    }
  },
  passingScore: {
    type: Number,
    required: [true, 'El puntaje de aprobación es requerido'],
    min: [1, 'El puntaje mínimo es 1%'],
    max: [100, 'El puntaje máximo es 100%'],
    default: 70
  },
  maxAttempts: {
    type: Number,
    required: true,
    min: [1, 'Mínimo 1 intento'],
    max: [10, 'Máximo 10 intentos'],
    default: 1 // D5: por defecto solo 1 intento
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'El creador es requerido']
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
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

// --- Virtuals ---
ExamSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

ExamSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// --- Índices ---
ExamSchema.index({ active: 1, deleted: 1 });
ExamSchema.index({ createdBy: 1 });

// --- Plugin soft delete ---
ExamSchema.plugin(softDeletePlugin);

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
