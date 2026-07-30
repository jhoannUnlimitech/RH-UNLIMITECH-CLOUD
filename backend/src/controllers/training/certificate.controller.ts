import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { certificateService } from '../../services/training/certificate.service';

/**
 * CertificateController — Endpoints de certificados de training.
 */

/** GET /api/v1/training/certificates/me — Mis certificados */
export const getMyCertificates = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const certs = await certificateService.getByEmployee(req.user!.id);
    res.json({ success: true, data: certs });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/certificates/:id — Detalle de un certificado */
export const getCertificateById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await certificateService.getById(req.params.id);
    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};

/** GET /api/v1/training/certificates/:id/download — Descargar PDF */
export const downloadCertificate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await certificateService.getById(req.params.id);

    if (cert.pdfBase64) {
      const pdfBuffer = Buffer.from(cert.pdfBase64, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cert.title}.pdf"`);
      res.send(pdfBuffer);
    } else {
      // No PDF generated yet — return certificate data for frontend rendering
      res.json({ success: true, data: cert, message: 'PDF no generado aún — use los datos para render en frontend' });
    }
  } catch (error) { next(error); }
};

/** POST /api/v1/training/certificates/:id/regenerate — Regenerar (admin) */
export const regenerateCertificate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cert = await certificateService.regenerate(req.params.id);
    res.json({ success: true, data: cert, message: 'Certificado regenerado' });
  } catch (error) { next(error); }
};
