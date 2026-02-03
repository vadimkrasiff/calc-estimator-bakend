import { Router } from 'express';
import * as materialController from '../controllers/materialController';
import * as materialCategoryController from '../controllers/materialCategoryController';

const router = Router();

router.get('/categories', materialCategoryController.getMaterialCategories);
router.get('/categories/:id', materialCategoryController.getMaterialCategory);
router.post('/categories', materialCategoryController.createMaterialCategory);
router.put('/categories/:id', materialCategoryController.updateMaterialCategory);
router.delete('/categories/:id', materialCategoryController.deleteMaterialCategory);
router.get('/', materialController.getMaterials);
router.get('/select-options', materialController.getMaterialsForSelect); // ← новый маршрут
router.get('/:id', materialController.getMaterial);
router.post('/', materialController.createMaterial);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

// Маршруты для категорий материалов



export default router;