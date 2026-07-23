import { Types } from 'mongoose';
import { ExtraAssignment, IExtraAssignment } from '../../models/training/ExtraAssignment';
import { Employee } from '../../models/Employee';
import { AppError } from '../../middleware/error';

/**
 * AssignmentService — Gestión de asignaciones extraordinarias.
 *
 * Las asignaciones pueden ser para todos los empleados o para personas específicas.
 * Se ordenan por prioridad (urgent > high > normal) en la vista del empleado.
 */

interface CreateAssignmentInput {
  type: 'course' | 'document' | 'directive';
  resource?: string;
  title: string;
  description?: string;
  assignedTo: 'all' | string[];
  reason: string;
  priority?: 'normal' | 'high' | 'urgent';
  dueDate?: string;
}

class AssignmentService {

  /**
   * Crear una asignación extraordinaria.
   * Notifica a los empleados asignados.
   */
  async create(data: CreateAssignmentInput, assignedById: string): Promise<IExtraAssignment> {
    const assignment = new ExtraAssignment({
      ...data,
      assignedBy: assignedById,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    await assignment.save();

    // Notificar a los empleados
    try {
      const { notificationService } = await import('../../services/notification.service');
      let recipientIds: string[] = [];

      if (data.assignedTo === 'all') {
        const employees = await Employee.find({ deleted: { $ne: true } }).select('_id');
        recipientIds = employees.map(e => e._id.toString());
      } else {
        recipientIds = data.assignedTo;
      }

      await notificationService.createBulk(recipientIds, {
        type: 'assignment_new',
        title: `📌 Nueva asignación: ${data.title}`,
        message: data.priority === 'urgent'
          ? `URGENTE: "${data.title}" — ${data.reason}`
          : `Se te asignó: "${data.title}" — ${data.reason}`,
        link: '/training/assignments',
        metadata: { assignmentId: assignment._id.toString(), priority: data.priority },
      });
    } catch { /* no bloquear */ }

    await assignment.populate('assignedBy', 'name email');
    return assignment;
  }

  /**
   * Obtener asignaciones pendientes de un empleado.
   * Ordenadas por prioridad (urgent > high > normal) luego por fecha.
   */
  async getMyAssignments(employeeId: string): Promise<IExtraAssignment[]> {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };

    const assignments = await ExtraAssignment.find({
      active: true,
      $or: [
        { assignedTo: 'all' },
        { assignedTo: employeeId },
      ],
      // Excluir las que ya completó este empleado
      'completions.employee': { $ne: new Types.ObjectId(employeeId) },
    })
      .populate('assignedBy', 'name')
      .populate('resource')
      .sort({ priority: 1, createdAt: -1 });

    // Ordenar por prioridad custom (el sort de mongo no funciona bien con enums)
    return assignments.sort((a, b) => {
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }

  /**
   * Obtener todas las asignaciones (admin).
   */
  async getAll(): Promise<IExtraAssignment[]> {
    return ExtraAssignment.find({ active: true })
      .populate('assignedBy', 'name email')
      .populate('resource')
      .sort({ createdAt: -1 });
  }

  /**
   * Marcar una asignación como completada por un empleado.
   */
  async complete(assignmentId: string, employeeId: string): Promise<IExtraAssignment> {
    if (!Types.ObjectId.isValid(assignmentId)) throw new AppError('ID no válido', 400);

    const assignment = await ExtraAssignment.findById(assignmentId);
    if (!assignment) throw new AppError('Asignación no encontrada', 404);

    // Verificar que el empleado está asignado
    if (assignment.assignedTo !== 'all') {
      const isAssigned = (assignment.assignedTo as Types.ObjectId[]).some(
        id => id.toString() === employeeId
      );
      if (!isAssigned) throw new AppError('No estás asignado a esta tarea', 403);
    }

    // Verificar que no la haya completado ya
    const alreadyCompleted = assignment.completions.some(
      c => c.employee.toString() === employeeId
    );
    if (alreadyCompleted) throw new AppError('Ya completaste esta asignación', 400);

    // Registrar completión
    assignment.completions.push({
      employee: new Types.ObjectId(employeeId),
      completedAt: new Date(),
    });
    await assignment.save();

    return assignment;
  }

  /**
   * Eliminar asignación (soft delete).
   */
  async delete(assignmentId: string): Promise<void> {
    if (!Types.ObjectId.isValid(assignmentId)) throw new AppError('ID no válido', 400);
    const assignment = await ExtraAssignment.findById(assignmentId);
    if (!assignment) throw new AppError('Asignación no encontrada', 404);
    await assignment.softDelete();
  }
}

export const assignmentService = new AssignmentService();
