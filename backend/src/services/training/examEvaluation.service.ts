import { Types } from 'mongoose';
import { ExamAttempt, IExamAttempt } from '../../models/training/ExamAttempt';
import { Exam } from '../../models/training/Exam';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { AppError } from '../../middleware/error';

/**
 * ExamEvaluationService — Evaluación manual de preguntas open_text por el admin.
 *
 * Flujo: getPending → evaluateAnswer (por pregunta) → completeEvaluation → pass/fail
 */

class ExamEvaluationService {

  /**
   * Obtener todos los intentos pendientes de evaluación.
   */
  async getPendingEvaluations(): Promise<IExamAttempt[]> {
    return ExamAttempt.find({ status: 'pending_evaluation' })
      .populate('employee', 'name email')
      .populate('exam', 'title passingScore')
      .sort({ submittedAt: 1 }); // Más antiguos primero
  }

  /**
   * Evaluar una respuesta de open_text en un intento.
   */
  async evaluateAnswer(attemptId: string, questionOrder: number, score: number, feedback?: string): Promise<IExamAttempt> {
    if (!Types.ObjectId.isValid(attemptId)) throw new AppError('ID de intento no válido', 400);

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) throw new AppError('Intento no encontrado', 404);
    if (attempt.status !== 'pending_evaluation') throw new AppError('Este intento no está pendiente de evaluación', 400);

    const answer = attempt.answers.find(a => a.questionOrder === questionOrder);
    if (!answer) throw new AppError(`Pregunta con order ${questionOrder} no encontrada`, 404);
    if (answer.type !== 'open_text') throw new AppError('Solo se pueden evaluar manualmente preguntas de respuesta libre', 400);

    // Validar score
    if (score < 0 || score > answer.maxScore) {
      throw new AppError(`El puntaje debe estar entre 0 y ${answer.maxScore}`, 400);
    }

    // Asignar evaluación
    answer.score = score;
    answer.feedback = feedback;
    answer.evaluatedAt = new Date();

    attempt.markModified('answers');
    await attempt.save();

    return attempt;
  }

  /**
   * Completar la evaluación — calcular puntaje final y determinar pass/fail.
   * Solo se puede llamar cuando TODAS las preguntas open_text tienen score.
   */
  async completeEvaluation(attemptId: string): Promise<IExamAttempt> {
    if (!Types.ObjectId.isValid(attemptId)) throw new AppError('ID de intento no válido', 400);

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) throw new AppError('Intento no encontrado', 404);
    if (attempt.status !== 'pending_evaluation') throw new AppError('Este intento no está pendiente de evaluación', 400);

    // Verificar que todas las open_text tienen score
    const unevaluated = attempt.answers.filter(a => a.type === 'open_text' && a.score === undefined);
    if (unevaluated.length > 0) {
      throw new AppError(`Faltan ${unevaluated.length} pregunta(s) por evaluar`, 400);
    }

    // Calcular puntaje total
    const totalScore = attempt.answers.reduce((sum, a) => sum + (a.score || 0), 0);
    attempt.totalScore = totalScore;
    attempt.percentage = Math.round((totalScore / attempt.maxScore) * 100);

    // Obtener passingScore del examen
    const exam = await Exam.findById(attempt.exam);
    const passingScore = exam?.passingScore || 80;

    attempt.passed = attempt.percentage >= passingScore;
    attempt.status = attempt.passed ? 'passed' : 'failed';
    attempt.evaluatedAt = new Date();

    await attempt.save();

    // Actualizar progreso si aprobó
    if (attempt.passed && attempt.level) {
      const progress = await EmployeeTrainingProgress.findOne({ employee: attempt.employee });
      if (progress) {
        const levelProgress = progress.levels.find(l => l.level.toString() === attempt.level!.toString());
        if (levelProgress) {
          levelProgress.status = 'completed';
          levelProgress.completedAt = new Date();
        }
        // Desbloquear siguiente nivel
        const { progressService } = await import('./progress.service');
        await (progressService as any).unlockNextLevel(progress, attempt.level.toString());
        await progress.save();
      }
    }

    // Notificar al empleado
    try {
      const { notificationService } = await import('../../services/notification.service');
      const examTitle = exam?.title || 'Examen';
      await notificationService.notifyExamGraded(attempt.employee.toString(), examTitle, attempt.passed, attempt.percentage);
    } catch { /* no bloquear */ }

    return attempt;
  }
}

export const examEvaluationService = new ExamEvaluationService();
