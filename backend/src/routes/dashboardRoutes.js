import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/me', authMiddleware, requireRole('user'), getDashboard);

export default router;
