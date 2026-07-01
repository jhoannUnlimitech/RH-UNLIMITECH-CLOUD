import { z } from 'zod';

/** Validador reutilizable para MongoDB ObjectId */
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'ID inválido');

/** ObjectId opcional */
export const optionalObjectId = objectId.optional();
