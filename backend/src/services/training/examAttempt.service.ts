import { Types } from 'mongoose';
import { ExamAttempt, IExamAttempt } from '../../models/training/ExamAttempt';
import { Exam } from '../../models/training/Exam';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { Employee } from '../../models/Employee';
import { AppError } from '../../middleware/error';

/**
 * ExamAttemptService — Lógica de tomar exámenes, cache y submit.
 *
 * Flujo: startExam → saveCache (periódico) → submitExam → auto-evaluate MC → pending_evaluation (si open_text)
 */

class ExamAttemptService {

  /**
   * Iniciar un intento de examen.
   * Valida: no agotó intentos, nivel en exam_pending.
   */
  async startExam(employeeId: string, examId: string): Promise<IExamAttempt> {
    if (!Types.ObjectId.isValid(examId)) throw new AppError('ID de examen no válido', 400);

    const exam = await Exam.findById(examId);
    if (!exam) throw new AppError('Examen no encontrado', 404);

    // Verificar intentos previos
    const previousAttempts = await ExamAttempt.countDocuments({
      employee: employeeId,
      exam: examId,
      status: { $in: ['submitted', 'pending_evaluation', 'passed', 'failed'] },
    });

    if (previousAttempts >= exam.maxAttempts) {
      throw new AppError(`Has agotado los ${exam.maxAttempts} intento(s) permitidos para este examen.`, 400);
    }

    // Verificar que no tenga un intento in_progress activo
    const activeAttempt = await ExamAttempt.findOne({
      employee: employeeId,
      exam: examId,
      status: 'in_progress',
    });
    if (activeAttempt) {
      // Retornar el intento activo (para continuar)
      return activeAttempt;
    }

    // Verificar que el nivel esté en exam_pending (si el examen tiene nivel)
    if (exam.level) {
      const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId });
      if (progress) {
        const levelProgress = progress.levels.find(l => l.level.toString() === exam.level!.toString());
        if (levelProgress && levelProgress.status !== 'exam_pending' && levelProgress.status !== 'exam_failed') {
          throw new AppError('Debes completar todos los cursos del nivel antes de tomar el examen.', 400);
        }
      }
    }

    // Crear intento
    const attempt = new ExamAttempt({
      employee: employeeId,
      exam: examId,
      level: exam.level,
      status: 'in_progress',
      maxScore: exam.questions.reduce((sum, q) => sum + q.points, 0),
      startedAt: new Date(),
    });
    await attempt.save();

    return attempt;
  }

  /**
   * Guardar cache de respuestas (periódico, desde frontend).
   */
  async saveCache(attemptId: string, employeeId: string, answers: Array<{ questionOrder: number; answer: string }>): Promise<void> {
    if (!Types.ObjectId.isValid(attemptId)) throw new AppError('ID de intento no válido', 400);

    const attempt = await ExamAttempt.findOne({ _id: attemptId, employee: employeeId, status: 'in_progress' });
    if (!attempt) throw new AppError('Intento no encontrado o ya finalizado', 404);

    attempt.cachedAnswers = answers.map(a => ({
      questionOrder: a.questionOrder,
      answer: a.answer,
      savedAt: new Date(),
    }));
    await attempt.save();
  }

  /**
   * Enviar examen — evalúa multiple_choice automáticamente.
   * Si hay open_text → status = pending_evaluation.
   * Si solo MC → status = passed/failed inmediato.
   */
  async submitExam(attemptId: string, employeeId: string, answers: Array<{ questionOrder: number; answer: string }>): Promise<IExamAttempt> {
    if (!Types.ObjectId.isValid(attemptId)) throw new AppError('ID de intento no válido', 400);

    const attempt = await ExamAttempt.findOne({ _id: attemptId, employee: employeeId, status: 'in_progress' });
    if (!attempt) throw new AppError('Intento no encontrado o ya finalizado', 404);

    const exam = await Exam.findById(attempt.exam);
    if (!exam) throw new AppError('Examen no encontrado', 404);

    // Evaluar cada respuesta
    let totalScore = 0;
    let hasOpenText = false;
    const evaluatedAnswers = [];

    for (const question of exam.questions) {
      const submitted = answers.find(a => a.questionOrder === question.order);
      const answerText = submitted?.answer || '';

      if (question.type === 'multiple_choice') {
        // Auto-evaluar: comparar con la opción correcta
        const correctOption = question.options?.find(o => o.isCorrect);
        const isCorrect = correctOption ? answerText === correctOption.text : false;
        const score = isCorrect ? question.points : 0;
        totalScore += score;

        evaluatedAnswers.push({
          questionOrder: question.order,
          questionText: question.question,
          type: 'multiple_choice' as const,
          answer: answerText,
          isCorrect,
          score,
          maxScore: question.points,
        });
      } else {
        // open_text: queda pendiente de evaluación manual
        hasOpenText = true;
        evaluatedAnswers.push({
          questionOrder: question.order,
          questionText: question.question,
          type: 'open_text' as const,
          answer: answerText,
          score: undefined,
          maxScore: question.points,
        });
      }
    }

    // Actualizar intento
    attempt.answers = evaluatedAnswers as any;
    attempt.cachedAnswers = []; // Limpiar cache
    attempt.submittedAt = new Date();

    if (hasOpenText) {
      // Tiene preguntas abiertas → pendiente de evaluación manual
      attempt.status = 'pending_evaluation';
      attempt.totalScore = totalScore; // Parcial (solo MC evaluado)
    } else {
      // Solo MC → resultado inmediato
      attempt.totalScore = totalScore;
      attempt.percentage = Math.round((totalScore / attempt.maxScore) * 100);
      attempt.passed = attempt.percentage >= exam.passingScore;
      attempt.status = attempt.passed ? 'passed' : 'failed';
      attempt.evaluatedAt = new Date();

      // Actualizar progreso si aprobó
      if (attempt.passed && exam.level) {
        await this.handleExamPassed(employeeId, exam.level.toString());
      }
    }

    await attempt.save();

    // Notificar a admins si tiene open_text pendiente
    if (hasOpenText) {
      try {
        const { notificationService } = await import('../../services/notification.service');
        const { Permission } = await import('../../models/Permission');
        const { Role } = await import('../../models/Role');

        // Buscar empleados con training:manage
        const managePerm = await Permission.findOne({ resource: 'training', action: 'manage' });
        if (managePerm) {
          const roles = await Role.find({ permissions: managePerm._id });
          const admins = await Employee.find({ role: { $in: roles.map(r => r._id) }, deleted: { $ne: true } });
          const adminIds = admins.map(a => a._id.toString());

          const employee = await Employee.findById(employeeId);
          const employeeName = employee?.name || 'Un empleado';
          await notificationService.notifyExamPendingReview(adminIds, employeeName, exam.title, attempt._id.toString());
        }
      } catch { /* no bloquear */ }
    }

    // Notificar al empleado si fue evaluado inmediatamente
    if (!hasOpenText) {
      try {
        const { notificationService } = await import('../../services/notification.service');
        await notificationService.notifyExamGraded(employeeId, exam.title, attempt.passed, attempt.percentage);
      } catch { /* no bloquear */ }
    }

    return attempt;
  }

  /**
   * Obtener un intento por ID.
   */
  async getById(attemptId: string, employeeId?: string): Promise<IExamAttempt> {
    if (!Types.ObjectId.isValid(attemptId)) throw new AppError('ID no válido', 400);

    const query: any = { _id: attemptId };
    if (employeeId) query.employee = employeeId;

    const attempt = await ExamAttempt.findOne(query)
      .populate('exam', 'title passingScore maxAttempts')
      .populate('employee', 'name email');

    if (!attempt) throw new AppError('Intento no encontrado', 404);
    return attempt;
  }

  /**
   * Manejar examen aprobado → marcar nivel como completed + desbloquear siguiente.
   */
  private async handleExamPassed(employeeId: string, levelId: string): Promise<void> {
    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId });
    if (!progress) return;

    const levelProgress = progress.levels.find(l => l.level.toString() === levelId);
    if (levelProgress) {
      levelProgress.status = 'completed';
      levelProgress.completedAt = new Date();
    }

    // Usar la lógica de unlockNextLevel del progressService
    const { progressService } = await import('./progress.service');
    await (progressService as any).unlockNextLevel(progress, levelId);
    await progress.save();
  }
}

export const examAttemptService = new ExamAttemptService();
