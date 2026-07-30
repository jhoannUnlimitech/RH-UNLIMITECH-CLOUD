import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permission';
import { getMyCertificates, getCertificateById, downloadCertificate, regenerateCertificate } from '../../controllers/training/certificate.controller';

const router = Router();

// Empleado: ver mis certificados
router.get('/me', authMiddleware, requirePermission('training', 'read'), getMyCertificates);

// Empleado: ver/descargar un certificado
router.get('/:id', authMiddleware, requirePermission('training', 'read'), getCertificateById);
router.get('/:id/download', authMiddleware, requirePermission('training', 'read'), downloadCertificate);

// Admin: regenerar certificado
router.post('/:id/regenerate', authMiddleware, requirePermission('training', 'manage'), regenerateCertificate);

export default router;
