import { Types } from 'mongoose';
import { Exam, IExam } from '../../models/training/Exam';
import { Level } from '../../models/training/Level';
import { AppError } from '../../middleware/error';

/**
 * ExamService — Lógica de negocio para Exámenes de Training.
 *
 * Gestiona el CRUD de exámenes y su asignación a niveles.
 * Cada nivel tiene un único examen asociado.
 */

interface CreateExamInput {
  title: string;
  description?: string;
  level: string;
  questions: Array<{
    question: string;
    type: 'multiple_choice' | 'open_text';
    options?: Array<{ text: string; isCorrect: boolean }>;
    expectedAnswer?: string;
    points?: number;
    order: number;
  }>;
  passingScore?: number;
  maxAttempts?: number;
  active?: boolean;
}

interface UpdateExamInput {
  title?: string;
  description?: string;
  level?: string;
  questions?: CreateExamInput['questions'];
  passingScore?: number;
  maxAttempts?: number;
  active?: boolean;
}

class ExamService {

  /**
   * Listar todos los exámenes (con filtros opcionales).
   */
  async getAll(filters?: { level?: string; active?: boolean }): Promise<IExam[]> {
    const query: any = {};
    if (filters?.level) query.level = filters.level;
    if (filters?.active !== undefined) query.active = filters.active;

    return Exam.find(query)
      .populate('level', 'name order')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener examen por ID.
   * Si stripAnswers=true, omite isCorrect de las opciones (para empleados).
   */
  async getById(id: string, stripAnswers = false): Promise<IExam> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de examen no válido', 400);
    }

    const exam = await Exam.findById(id)
      .populate('level', 'name order')
      .populate('createdBy', 'name email');

    if (!exam) {
      throw new AppError('Examen no encontrado', 404);
    }

    // Para empleados: ocultar respuestas correctas
    if (stripAnswers) {
      const examObj = exam.toJSON();
      examObj.questions = examObj.questions.map((q: any) => {
        if (q.type === 'multiple_choice' && q.options) {
          q.options = q.options.map((o: any) => ({ text: o.text })); // Quitar isCorrect
        }
        delete q.expectedAnswer; // Quitar respuesta esperada
        return q;
      });
      return examObj as IExam;
    }

    return exam;
  }

  /**
   * Obtener examen por nivel.
   */
  async getByLevel(levelId: string): Promise<IExam | null> {
    if (!Types.ObjectId.isValid(levelId)) {
      throw new AppError('ID de nivel no válido', 400);
    }

    return Exam.findOne({ level: levelId })
      .populate('level', 'name order')
      .populate('createdBy', 'name email');
  }

  /**
   * Crear un examen nuevo.
   * Valida que el nivel existe y no tenga ya un examen.
   */
  async create(data: CreateExamInput, createdBy: string): Promise<IExam> {
    if (!Types.ObjectId.isValid(data.level)) {
      throw new AppError('ID de nivel no válido', 400);
    }

    // Validar que el nivel existe
    const level = await Level.findById(data.level);
    if (!level) {
      throw new AppError('Nivel no encontrado', 404);
    }

    // Validar que el nivel no tenga ya un examen
    const existingExam = await Exam.findOne({ level: data.level });
    if (existingExam) {
      throw new AppError('Este nivel ya tiene un examen asignado', 409);
    }

    // Validar preguntas de multiple_choice
    for (const q of data.questions) {
      if (q.type === 'multiple_choice') {
        if (!q.options || q.options.length < 2) {
          throw new AppError(`La pregunta "${q.question.slice(0, 50)}..." necesita al menos 2 opciones`, 400);
        }
        const correctCount = q.options.filter(o => o.isCorrect).length;
        if (correctCount !== 1) {
          throw new AppError(`La pregunta "${q.question.slice(0, 50)}..." debe tener exactamente 1 opción correcta`, 400);
        }
      }
    }

    const exam = new Exam({
      ...data,
      createdBy,
    });
    await exam.save();

    // Actualizar referencia del examen en el nivel
    level.exam = exam._id as Types.ObjectId;
    await level.save();

    await exam.populate('level', 'name order');
    await exam.populate('createdBy', 'name email');

    return exam;
  }

  /**
   * Actualizar un examen existente.
   */
  async update(id: string, data: UpdateExamInput): Promise<IExam> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de examen no válido', 400);
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new AppError('Examen no encontrado', 404);
    }

    // Si cambia de nivel, validar el nuevo
    if (data.level && data.level !== exam.level.toString()) {
      if (!Types.ObjectId.isValid(data.level)) {
        throw new AppError('ID de nuevo nivel no válido', 400);
      }
      const newLevel = await Level.findById(data.level);
      if (!newLevel) {
        throw new AppError('Nuevo nivel no encontrado', 404);
      }
      const existingExam = await Exam.findOne({ level: data.level, _id: { $ne: id } });
      if (existingExam) {
        throw new AppError('El nuevo nivel ya tiene un examen asignado', 409);
      }

      // Quitar referencia del nivel anterior
      const oldLevel = await Level.findById(exam.level);
      if (oldLevel) {
        oldLevel.exam = undefined;
        await oldLevel.save();
      }

      // Asignar al nuevo nivel
      newLevel.exam = exam._id as Types.ObjectId;
      await newLevel.save();
    }

    // Aplicar cambios
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (exam as any)[key] = value;
      }
    });

    await exam.save();
    await exam.populate('level', 'name order');
    await exam.populate('createdBy', 'name email');

    return exam;
  }

  /**
   * Reordenar preguntas de un examen.
   */
  async reorderQuestions(id: string, newOrders: Array<{ order: number }>): Promise<IExam> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de examen no válido', 400);
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new AppError('Examen no encontrado', 404);
    }

    if (newOrders.length !== exam.questions.length) {
      throw new AppError('La cantidad de órdenes no coincide con las preguntas', 400);
    }

    // Reasignar órdenes
    exam.questions.forEach((q, i) => {
      q.order = newOrders[i].order;
    });

    // Reordenar array por el nuevo order
    exam.questions.sort((a, b) => a.order - b.order);
    exam.markModified('questions');
    await exam.save();

    await exam.populate('level', 'name order');
    await exam.populate('createdBy', 'name email');

    return exam;
  }

  /**
   * Eliminar examen (soft delete).
   * Quita la referencia del nivel.
   */
  async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de examen no válido', 400);
    }

    const exam = await Exam.findById(id);
    if (!exam) {
      throw new AppError('Examen no encontrado', 404);
    }

    // Quitar referencia del nivel
    const level = await Level.findById(exam.level);
    if (level) {
      level.exam = undefined;
      await level.save();
    }

    await exam.softDelete();
  }
}

export const examService = new ExamService();
