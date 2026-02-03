import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken, profileController.getProfile);
router.put('/', authenticateToken, profileController.updateProfile);
router.post('/change-password', authenticateToken, profileController.changePassword);

export default router;