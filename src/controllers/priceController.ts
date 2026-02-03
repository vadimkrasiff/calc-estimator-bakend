import { Request, Response } from 'express';
import { z } from 'zod';
import * as priceModel from '../models/price';

const priceSchema = z.object({
  materialId: z.string(), // ID материала
  price: z.number().positive(), // цена
  supplier: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // YYYY-MM-DD
});

export const getPrices = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const materialId = req.query.materialId as string;
    const date = req.query.date as string;
    const latestOnly = req.query.latestOnly === 'true'; // ← новый параметр

    const result = await priceModel.getAllPrices(page, pageSize, materialId, date, latestOnly);
    res.json({
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
};

export const getPricesByMaterial = async (req: Request, res: Response) => {
  try {
    const { materialId } = req.params;
    const prices = await priceModel.getPricesByMaterialId(materialId);
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices for material' });
  }
};

export const getPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const price = await priceModel.getPriceById(id);
    if (!price) {
      return res.status(404).json({ error: 'Price not found' });
    }
    res.json(price);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
};

export const createPrice = async (req: Request, res: Response) => {
  try {
    const parsed = priceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const newPrice = await priceModel.createPrice(parsed.data);
    res.status(201).json(newPrice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create price' });
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = priceSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const updated = await priceModel.updatePrice(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'Price not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update price' });
  }
};

export const deletePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await priceModel.deletePrice(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Price not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete price' });
  }
};