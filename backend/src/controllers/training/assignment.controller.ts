import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { assignmentService } from '../../services/training/assignment.service';

/**
 * Assignment Controller — Asignaciones extraordinarias de training.
 */

/** GET /api/v1/training/assignments/me */
export const getMyAssignments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignments = await assignmentService.getMyAssignments(req.user!.id);
    res.json({ success: true, data: assignments });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/assignments */
export const getAllAssignments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignments = await assignmentService.getAll();
    res.json({ success: true, data: assignments });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/assignments */
export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignment = await assignmentService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: assignment, message: 'Asignación creada' });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/assignments/:id/complete */
export const completeAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assignment = await assignmentService.complete(req.params.id, req.user!.id);
    res.json({ success: true, data: assignment, message: 'Asignación completada' });
  } catch (error) { next(error); }
};

/** DELETE /api/v1/training/assignments/:id */
export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await assignmentService.delete(req.params.id);
    res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) { next(error); }
};
