import { Router } from 'express';
import * as simpleCalculationController from '../controllers/simpleCalculationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/', simpleCalculationController.getUserCalculations);
router.get('/:id', simpleCalculationController.getCalculationById);
router.post('/', simpleCalculationController.createCalculation);
router.delete('/:id', simpleCalculationController.deleteCalculation);
router.post('/:id/share', simpleCalculationController.shareCalculation);
router.delete('/:id/share', simpleCalculationController.unshareCalculation);

export default router;