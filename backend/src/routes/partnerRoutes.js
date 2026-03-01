import { Router } from 'express';
import { getPendingDeliveries, reviewDelivery } from '../controllers/partnerController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware, requireRole('partner'));
router.get('/deliveries/pending', getPendingDeliveries);
router.patch('/deliveries/:id/review', reviewDelivery);

export default router;
