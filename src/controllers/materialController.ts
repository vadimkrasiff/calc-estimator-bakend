import { Request, Response } from 'express';
import { z } from 'zod';
import * as materialModel from '../models/material';

export const materialSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  unit: z.enum(['шт', 'м²', 'м³', 'кг', 'пог.м'], {
    required_error: 'Выберите единицу измерения',
  }),
  categoryId: z.number().optional(),
  description: z.string().optional(),

  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  nominalWidth: z.number().int().positive().optional(),
  nominalHeight: z.number().int().positive().optional(),
  defaultWasteFactor: z.number().positive().optional(),
});

export const getMaterials = async (_req: Request, res: Response) => {
  try {
    const materials = await materialModel.getAllMaterials();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

export const getMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const material = await materialModel.getMaterialById(id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch material' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const parsed = materialSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const newMaterial = await materialModel.createMaterial(parsed.data);
    res.status(201).json(newMaterial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create material' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = materialSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const updated = await materialModel.updateMaterial(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update material' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await materialModel.deleteMaterial(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
};

export const getMaterialsForSelect = async (_req: Request, res: Response) => {
  try {
    const materials = await materialModel.getMaterialsForSelect();
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch materials for select' });
  }
};