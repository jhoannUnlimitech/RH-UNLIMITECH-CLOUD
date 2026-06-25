import { Router } from 'express';
import { getMyReports, getEmployeeReports, getDivisionReports } from '../controllers/weeklyReport.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/me', getMyReports);
router.get('/employee/:employeeId', getEmployeeReports);
router.get('/division/:divisionId', getDivisionReports);

export default router;
