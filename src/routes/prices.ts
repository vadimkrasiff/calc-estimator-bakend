import { Router } from 'express';
import * as priceController from '../controllers/priceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты требуют авторизации
router.get('/', authenticateToken, priceController.getPrices);
router.get('/material/:materialId', authenticateToken, priceController.getPricesByMaterial);
router.get('/:id', authenticateToken, priceController.getPrice);
router.post('/', authenticateToken, priceController.createPrice);
router.put('/:id', authenticateToken, priceController.updatePrice);
router.delete('/:id', authenticateToken, priceController.deletePrice);

export default router;