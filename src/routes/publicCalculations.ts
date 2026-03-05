import { Router } from 'express';
import * as calculationController from '../controllers/calculationConfigController';

const router = Router();

// Публичный доступ к расшаренным конфигурациям
router.get('/calculations/:shareId', calculationController.getSharedConfig);

export default router;