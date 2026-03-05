import { Router } from 'express';
import * as calculationController from '../controllers/calculationConfigController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты защищены
router.use(authenticateToken);

// Получить список конфигураций
router.get('/', calculationController.getUserConfigs);

// Получить конкретную конфигурацию
router.get('/:id', calculationController.getConfigById);

// Создать новую конфигурацию
router.post('/', calculationController.createConfig);

// Обновить конфигурацию
router.put('/:id', calculationController.updateConfig);

// Удалить конфигурацию
router.delete('/:id', calculationController.deleteConfig);

// Создать публичную ссылку
router.post('/:id/share', calculationController.shareConfig);

// Отменить публикацию
router.delete('/:id/share', calculationController.unshareConfig);

export default router;