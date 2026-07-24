import { Router } from 'express';
import libraryRoutes from './library.routes';
import coursesRoutes from './courses.routes';
import levelsRoutes from './levels.routes';
import badgesRoutes from './badges.routes';
import examsRoutes from './exams.routes';
import examAttemptsRoutes from './examAttempts.routes';
import progressRoutes from './progress.routes';
import assignmentsRoutes from './assignments.routes';
import studyReportsRoutes from './studyReports.routes';
import attendanceRoutes from './attendance.routes';
import honorTableRoutes from './honorTable.routes';

/**
 * Training Module Routes — Barrel
 *
 * Monta todas las sub-rutas del módulo Training.
 * Base: /api/v1/training (para cursos/niveles/etc.)
 *       /api/v1/library (para la biblioteca documental)
 */

const router = Router();

// Rutas de Training
router.use('/courses', coursesRoutes);
router.use('/levels', levelsRoutes);
router.use('/badges', badgesRoutes);
router.use('/exams', examsRoutes);
router.use('/exam-attempts', examAttemptsRoutes);
router.use('/progress', progressRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/study-reports', studyReportsRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/honor-table', honorTableRoutes);

// Rutas de la Biblioteca (categorías + documentos)
// Se montan en /api/v1/library desde el index principal
export const libraryRouter = libraryRoutes;

// Rutas de Training (cursos, niveles, insignias, progreso, etc.)
// Se agregarán en slices futuros:
// router.use('/courses', coursesRoutes);
// router.use('/levels', levelsRoutes);
// router.use('/badges', badgesRoutes);
// router.use('/exams', examsRoutes);
// router.use('/progress', progressRoutes);
// router.use('/reports', reportsRoutes);
// router.use('/honor-table', honorTableRoutes);
// router.use('/certificates', certificatesRoutes);
// router.use('/config', configRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/assignments', assignmentsRoutes);

export default router;
