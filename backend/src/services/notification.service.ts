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

  // ─── Helpers para CSW ─────────────────────────────────────────────────────

  /**
   * Notificar que una CSW fue aprobada.
   */
  async notifyCSWApproved(employeeId: string, cswCategory: string, cswId: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'csw_approved',
      title: '✅ Solicitud aprobada',
      message: `Tu solicitud de "${cswCategory}" fue aprobada.`,
      link: `/csw/view/${cswId}`,
      metadata: { cswId },
    });
  }

  /**
   * Notificar que una CSW fue rechazada.
   */
  async notifyCSWRejected(employeeId: string, cswCategory: string, cswId: string, reason?: string): Promise<void> {
    await this.create({
      recipient: employeeId,
      type: 'csw_rejected',
      title: '❌ Solicitud rechazada',
      message: reason
        ? `Tu solicitud de "${cswCategory}" fue rechazada: "${reason}"`
        : `Tu solicitud de "${cswCategory}" fue rechazada.`,
      link: `/csw/view/${cswId}`,
      metadata: { cswId },
    });
  }

  /**
   * Notificar que hay una CSW pendiente de aprobación.
   */
  async notifyCSWPending(approverId: string, requesterName: string, cswCategory: string, cswId: string): Promise<void> {
    await this.create({
      recipient: approverId,
      type: 'csw_pending',
      title: '📋 Solicitud pendiente',
      message: `${requesterName} envió una solicitud de "${cswCategory}" que requiere tu aprobación.`,
      link: `/csw/view/${cswId}`,
      metadata: { cswId },
    });
  }

  // ─── Helpers para Calendario ──────────────────────────────────────────────

  /**
   * Notificar evento del día a empleados.
   */
  async notifyCalendarEvent(employeeIds: string[], eventTitle: string, eventDate: string): Promise<void> {
    await this.createBulk(employeeIds, {
      type: 'calendar_event',
      title: '📅 Evento hoy',
      message: `Recuerda: "${eventTitle}" está programado para hoy (${eventDate}).`,
      link: '/calendar',
      metadata: { eventTitle, eventDate },
    });
  }

  // ─── Helpers para Exámenes (admin) ────────────────────────────────────────

  /**
   * Notificar a admins de training que un examen necesita revisión manual.
   */
  async notifyExamPendingReview(adminIds: string[], employeeName: string, examTitle: string, attemptId: string): Promise<void> {
    await this.createBulk(adminIds, {
      type: 'exam_pending_review',
      title: '📝 Examen pendiente de revisión',
      message: `${employeeName} completó el examen "${examTitle}" y tiene preguntas abiertas que requieren evaluación manual.`,
      link: '/training/admin/evaluations',
      metadata: { attemptId, examTitle },
    });
  }
}

export const notificationService = new NotificationService();
