/**
 * Utilidades para el módulo CSW
 */

/**
 * Convierte un string a UPPER_SNAKE_CASE
 * Ejemplo: "Aumento Salarial" → "AUMENTO_SALARIAL"
 */
export const toUpperSnakeCase = (str: string): string =>
  str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^A-Z0-9]+/g, '_')    // Reemplazar caracteres especiales por _
    .replace(/^_|_$/g, '');          // Quitar _ al inicio/final

/**
 * Genera el título formateado de un CSW
 * Formato: CSW-{CATEGORIA_UPPER_SNAKE}-{YYYYMMDD}-{5chars}
 * Ejemplo: CSW-PERMISO-20260624-6a3c5
 */
export const formatCSWTitle = (csw: {
  _id: string;
  category?: { name: string } | string | null;
  createdAt: string;
}): string => {
  const catName = typeof csw.category === 'object' && csw.category
    ? toUpperSnakeCase(csw.category.name)
    : 'OTRO';
  const date = new Date(csw.createdAt).toISOString().split('T')[0].replace(/-/g, '');
  const idShort = csw._id.substring(0, 5);
  return `CSW-${catName}-${date}-${idShort}`;
};

/**
 * Colores de badge según estado del CSW
 */
export const cswStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'light', label: 'Borrador' },
  pending: { color: 'warning', label: 'Pendiente' },
  approved: { color: 'success', label: 'Aprobado' },
  rejected: { color: 'error', label: 'Rechazado' },
  cancelled: { color: 'light', label: 'Cancelado' },
};
