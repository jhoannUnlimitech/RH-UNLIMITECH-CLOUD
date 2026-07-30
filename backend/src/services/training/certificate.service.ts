import { Certificate, ICertificate } from '../../models/training/Certificate';
import { Employee } from '../../models/Employee';
import { Level } from '../../models/training/Level';
import { Badge } from '../../models/training/Badge';
import { EmployeeTrainingProgress } from '../../models/training/EmployeeTrainingProgress';
import { AppError } from '../../middleware/error';

/**
 * CertificateService — Generación y gestión de certificados de training.
 *
 * Auto-genera certificados al completar niveles o insignias.
 * Almacena las variables resueltas + PDF en base64.
 */

class CertificateService {

  /**
   * Generar certificado de nivel completado.
   * Se llama automáticamente al pasar un examen y completar el nivel.
   */
  async generateLevelCertificate(employeeId: string, levelId: string, examScore?: number): Promise<ICertificate> {
    // Verificar que no exista ya
    const existing = await Certificate.findOne({ employee: employeeId, type: 'level', referenceId: levelId });
    if (existing) return existing;

    const employee = await Employee.findById(employeeId).populate('division', 'name').populate('role', 'name');
    if (!employee) throw new AppError('Empleado no encontrado', 404);

    const level = await Level.findById(levelId);
    if (!level) throw new AppError('Nivel no encontrado', 404);

    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId });

    const variables = {
      employeeName: employee.name,
      employeeDivision: (employee.division as any)?.name || '',
      employeeHat: (employee.role as any)?.name || '',
      completedDate: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
      totalHours: progress?.totalStudyHours || 0,
      levelName: level.name,
      examScore,
    };

    const certificate = await Certificate.create({
      employee: employeeId,
      type: 'level',
      referenceId: levelId,
      referenceName: level.name,
      title: `Certificado — ${level.name}`,
      variables,
      issuedAt: new Date(),
    });

    return certificate;
  }

  /**
   * Generar certificado de insignia completada.
   * Se llama cuando todos los niveles de una insignia están completados.
   */
  async generateBadgeCertificate(employeeId: string, badgeId: string): Promise<ICertificate> {
    const existing = await Certificate.findOne({ employee: employeeId, type: 'badge', referenceId: badgeId });
    if (existing) return existing;

    const employee = await Employee.findById(employeeId).populate('division', 'name').populate('role', 'name');
    if (!employee) throw new AppError('Empleado no encontrado', 404);

    const badge = await Badge.findById(badgeId);
    if (!badge) throw new AppError('Insignia no encontrada', 404);

    const progress = await EmployeeTrainingProgress.findOne({ employee: employeeId });

    const variables = {
      employeeName: employee.name,
      employeeDivision: (employee.division as any)?.name || '',
      employeeHat: (employee.role as any)?.name || '',
      completedDate: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
      totalHours: progress?.totalStudyHours || 0,
      badgeName: badge.name,
    };

    const certificate = await Certificate.create({
      employee: employeeId,
      type: 'badge',
      referenceId: badgeId,
      referenceName: badge.name,
      title: `Certificado de Insignia — ${badge.name}`,
      variables,
      issuedAt: new Date(),
    });

    return certificate;
  }

  /**
   * Obtener certificados de un empleado.
   */
  async getByEmployee(employeeId: string): Promise<ICertificate[]> {
    return Certificate.find({ employee: employeeId }).sort({ issuedAt: -1 });
  }

  /**
   * Obtener un certificado por ID.
   */
  async getById(id: string): Promise<ICertificate> {
    const cert = await Certificate.findById(id);
    if (!cert) throw new AppError('Certificado no encontrado', 404);
    return cert;
  }

  /**
   * Regenerar el PDF de un certificado (admin).
   */
  async regenerate(id: string): Promise<ICertificate> {
    const cert = await Certificate.findById(id);
    if (!cert) throw new AppError('Certificado no encontrado', 404);
    // Re-generar PDF (por ahora solo actualiza fecha)
    cert.issuedAt = new Date();
    cert.pdfBase64 = undefined; // Se regenerará al descargar
    await cert.save();
    return cert;
  }
}

export const certificateService = new CertificateService();
