import { Router } from 'express';
import * as userController from '../controllers/userController';
import * as invitationController from '../controllers/invitationController';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Только администратор может управлять пользователями
router.get('/', authenticateToken, adminMiddleware, userController.getUsers);
router.get('/:id', authenticateToken, adminMiddleware, userController.getUser);
router.post('/', authenticateToken, adminMiddleware, userController.createUser);
router.put('/:id', authenticateToken, adminMiddleware, userController.updateUser);
router.delete('/:id', authenticateToken, adminMiddleware, userController.deleteUser);

// Публичный маршрут для регистрации по приглашению
router.post('/register-with-invitation', userController.createUserWithInvitation);

export default router;