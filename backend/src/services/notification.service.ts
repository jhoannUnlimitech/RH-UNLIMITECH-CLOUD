import { Types } from 'mongoose';
import { Notification, INotification, NotificationType } from '../models/Notification';

/**
 * NotificationService — Servicio transversal de notificaciones.
 *
 * Crea y gestiona notificaciones para empleados.
 * Usado por otros servicios (training, CSW, etc.) para notificar eventos.
 */

interface CreateNotificationInput {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}

class NotificationService {

  /**
   * Crear una notificación para un empleado.
   */
  async create(data: CreateNotificationInput): Promise<INotification> {
    return Notification.create(data);
  }

  /**
   * Crear notificaciones para múltiples empleados (bulk).
   */
  async createBulk(recipients: string[], data: Omit<CreateNotificationInput, 'recipient'>): Promise<void> {
    const notifications = recipients.map(recipient => ({
      recipient: new Types.ObjectId(recipient),
      ...data,
    }));
    await Notification.insertMany(notifications);
  }

  /**
   * Obtener notificaciones de un empleado (más recientes primero).
   */
  async getByEmployee(employeeId: string, limit = 20): Promise<INotification[]> {
    return Notification.find({ recipient: employeeId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Obtener cantidad de no leídas.
   */
  async getUnreadCount(employeeId: string): Promise<number> {
    return Notification.countDocuments({ recipient: employeeId, read: false });
  }

  /**
   * Marcar una notificación como leída.
   */
  async markAsRead(notificationId: string, employeeId: string): Promise<void> {
    await Notification.updateOne(
      { _id: notificationId, recipient: employeeId },
      { $set: { read: true, readAt: new Date() } }
    );
  }

  /**
   * Marcar todas las notificaciones como leídas.
   */
  async markAllAsRead(employeeId: string): Promise<void> {
    await Notification.updateMany(
      { recipient: employeeId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
  }

  // ─── Helpers para Training ────────────────────────────────────────────────

  /**
   * Notificar asignación de curso a un empleado.
   */
  async notifyCourseAssigned(employeeId: string, courseName: string, courseId: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'course_assigned',
      title: 'Nuevo curso asignado',
      message: `Se te asignó el curso "${courseName}". Revisa tu progreso para comenzar.`,
      link: '/training/my-progress',
      metadata: { courseId },
    });
  }

  /**
   * Notificar asignación de examen.
   */
  async notifyExamAssigned(employeeId: string, examTitle: string, examId: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'exam_assigned',
      title: 'Examen disponible',
      message: `Tienes un examen pendiente: "${examTitle}". Prepárate y tómalo cuando estés listo.`,
      link: `/training/exam/${examId}`,
      metadata: { examId },
    });
  }

  /**
   * Notificar que un examen fue evaluado.
   */
  async notifyExamGraded(employeeId: string, examTitle: string, passed: boolean, score: number): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'exam_graded',
      title: passed ? '¡Examen aprobado!' : 'Examen no aprobado',
      message: passed
        ? `Felicidades, aprobaste "${examTitle}" con ${score}%. ¡Sigue avanzando!`
        : `No aprobaste "${examTitle}" (${score}%). Revisa el material y reintenta.`,
      link: '/training/my-progress',
      metadata: { passed, score },
    });
  }

  /**
   * Notificar que se desbloqueó un nuevo nivel.
   */
  async notifyLevelUnlocked(employeeId: string, levelName: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'level_unlocked',
      title: 'Nuevo nivel desbloqueado',
      message: `¡Avanzaste! Ahora estás en el nivel "${levelName}". Revisa los nuevos cursos.`,
      link: '/training/my-progress',
    });
  }

  /**
   * Notificar que se obtuvo una insignia.
   */
  async notifyBadgeEarned(employeeId: string, badgeName: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'badge_earned',
      title: '🏆 ¡Insignia obtenida!',
      message: `Completaste todos los niveles y obtuviste la insignia "${badgeName}". ¡Excelente trabajo!`,
      link: '/training/my-progress',
    });
  }
}

export const notificationService = new NotificationService();
