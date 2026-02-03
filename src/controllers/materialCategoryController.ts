import { Request, Response } from 'express';
import { z } from 'zod';
import * as categoryModel from '../models/materialCategory';

const materialCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const getMaterialCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err); // ← добавь лог
    res.status(500).json({ error: 'Failed to fetch material categories1' });
  }
};

export const getMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);
    if (!category) {
      return res.status(404).json({ error: 'Material category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch material category' });
  }
};

export const createMaterialCategory = async (req: Request, res: Response) => {
  try {
    const parsed = materialCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const newCategory = await categoryModel.createCategory(parsed.data);
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create material category' });
  }
};

export const updateMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = materialCategorySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const updated = await categoryModel.updateCategory(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Material category not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update material category' });
  }
};

export const deleteMaterialCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await categoryModel.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Material category not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material category' });
  }
};