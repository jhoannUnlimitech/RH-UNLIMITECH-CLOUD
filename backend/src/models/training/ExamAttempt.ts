import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ExamAttempt — Intento de examen de un empleado.
 *
 * Lifecycle: in_progress → submitted → pending_evaluation → passed | failed
 * Cache: cachedAnswers se guarda periódicamente (localStorage frontend + API)
 * y se limpia al hacer submit.
 */

export type AttemptStatus = 'in_progress' | 'submitted' | 'pending_evaluation' | 'passed' | 'failed';

export interface ICachedAnswer {
  questionOrder: number;
  answer: string;
  savedAt: Date;
}

export interface IExamAnswer {
  questionOrder: number;
  questionText: string;
  type: 'multiple_choice' | 'open_text';
  answer: string;                    // Texto seleccionado o respuesta libre
  isCorrect?: boolean;               // Solo para multiple_choice (auto-evaluado)
  score?: number;                    // Puntaje obtenido (0 a question.points)
  maxScore: number;                  // Puntaje máximo de la pregunta
  feedback?: string;                 // Feedback del evaluador (open_text)
  evaluatedAt?: Date;
}

export interface IExamAttempt extends Document {
  employee: Types.ObjectId;
  exam: Types.ObjectId;
  level?: Types.ObjectId;
  answers: IExamAnswer[];
  cachedAnswers?: ICachedAnswer[];
  status: AttemptStatus;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: Date;
  submittedAt?: Date;
  evaluatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CachedAnswerSchema = new Schema<ICachedAnswer>({
  questionOrder: { type: Number, required: true },
  answer: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
}, { _id: false });

const ExamAnswerSchema = new Schema<IExamAnswer>({
  questionOrder: { type: Number, required: true },
  questionText: { type: String, required: true },
  type: { type: String, enum: ['multiple_choice', 'open_text'], required: true },
  answer: { type: String, required: true },
  isCorrect: { type: Boolean },
  score: { type: Number, min: 0 },
  maxScore: { type: Number, required: true, min: 0 },
  feedback: { type: String },
  evaluatedAt: { type: Date },
}, { _id: false });

const ExamAttemptSchema = new Schema<IExamAttempt>({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true,
  },
  exam: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  level: {
    type: Schema.Types.ObjectId,
    ref: 'Level',
  },
  answers: {
    type: [ExamAnswerSchema],
    default: [],
  },
  cachedAnswers: {
    type: [CachedAnswerSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'pending_evaluation', 'passed', 'failed'],
    default: 'in_progress',
  },
  totalScore: { type: Number, default: 0, min: 0 },
  maxScore: { type: Number, default: 0, min: 0 },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  passed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  evaluatedAt: { type: Date },
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
ExamAttemptSchema.index({ employee: 1, exam: 1 });
ExamAttemptSchema.index({ status: 1 });
ExamAttemptSchema.index({ exam: 1, passed: 1 });

export const ExamAttempt = mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema);
