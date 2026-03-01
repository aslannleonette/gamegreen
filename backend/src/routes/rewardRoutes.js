import { Router } from 'express';
import { listRewards, redeemReward } from '../controllers/rewardController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, listRewards);
router.post('/:rewardId/redeem', authMiddleware, requireRole('user'), redeemReward);

export default router;
