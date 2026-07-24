import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { bonusService } from '../../services/training/bonus.service';

/**
 * BonusController — Gestión de bonificaciones y rangos.
 */

// ─── RANGES ────────────────────────────────────────────────────────────────────

/** GET /api/v1/training/bonuses/ranges */
export const getRanges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ranges = await bonusService.getAllRanges();
    res.json({ success: true, data: ranges });
  } catch (error) { next(error); }
};

/** POST /api/v1/training/bonuses/ranges */
export const createRange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const range = await bonusService.createRange(req.body);
    res.status(201).json({ success: true, data: range, message: 'Rango creado' });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/bonuses/ranges/:id */
export const updateRange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const range = await bonusService.updateRange(req.params.id, req.body);
    res.json({ success: true, data: range, message: 'Rango actualizado' });
  } catch (error) { next(error); }
};

/** DELETE /api/v1/training/bonuses/ranges/:id */
export const deleteRange = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await bonusService.deleteRange(req.params.id);
    res.json({ success: true, message: 'Rango desactivado' });
  } catch (error) { next(error); }
};

// ─── BONUS RECORDS ─────────────────────────────────────────────────────────────

/** POST /api/v1/training/bonuses/calculate — Calcular bonos de un trimestre */
export const calculateBonuses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quarter, year } = req.body;
    const result = await bonusService.calculateQuarterlyBonuses(quarter, year);
    res.json({ success: true, data: result, message: `Bonos calculados: ${result.created} creados, ${result.skipped} existentes` });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/bonuses/quarter/:year/:quarter */
export const getQuarterBonuses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bonuses = await bonusService.getQuarterBonuses(Number(req.params.quarter), Number(req.params.year));
    res.json({ success: true, data: bonuses });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/bonuses/pending */
export const getPendingBonuses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bonuses = await bonusService.getPendingBonuses();
    res.json({ success: true, data: bonuses });
  } catch (error) { next(error); }
};

/** PUT /api/v1/training/bonuses/:id/pay */
export const markAsPaid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bonus = await bonusService.markAsPaid(req.params.id, req.user!.id, req.body.notes);
    res.json({ success: true, data: bonus, message: 'Bono marcado como pagado' });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/bonuses/me */
export const getMyBonuses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bonuses = await bonusService.getEmployeeBonuses(req.user!.id);
    res.json({ success: true, data: bonuses });
  } catch (error) { next(error); }
};
