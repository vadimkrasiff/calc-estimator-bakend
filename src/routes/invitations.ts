import { Router } from 'express';
import * as invitationController from '../controllers/invitationController';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Только администратор может отправлять приглашения
router.post('/', authenticateToken, adminMiddleware, invitationController.inviteUser);
router.get('/:token', invitationController.validateInvitation); // публичный маршрут

export default router;