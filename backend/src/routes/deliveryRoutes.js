import { Router } from 'express';
import { createDelivery, getMyDeliveries } from '../controllers/deliveryController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware, requireRole('user'));
router.post('/', createDelivery);
router.get('/me', getMyDeliveries);

export default router;
