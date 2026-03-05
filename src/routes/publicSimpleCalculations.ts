import { Router } from 'express';
import * as simpleCalculationController from '../controllers/simpleCalculationController';

const router = Router();

router.get('/simple-calculations/:shareId', simpleCalculationController.getPublicCalculation);

export default router;