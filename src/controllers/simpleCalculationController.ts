import { Request, Response } from 'express';
import * as SimpleCalculationModel from '../models/simpleCalculation';
import { randomUUID } from 'crypto';

export const getUserCalculations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const calculations = await SimpleCalculationModel.getUserSimpleCalculations(userId);
    res.json(calculations);
  } catch (error) {
    console.error('Error fetching simple calculations:', error);
    res.status(500).json({ error: 'Failed to fetch calculations' });
  }
};

export const getCalculationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const calculation = await SimpleCalculationModel.getSimpleCalculationById(parseInt(id), userId);
    
    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    
    res.json(calculation);
  } catch (error) {
    console.error('Error fetching calculation:', error);
    res.status(500).json({ error: 'Failed to fetch calculation' });
  }
};

export const createCalculation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, houseData, materials, laborCosts, totalCost, totalCostWithWaste } = req.body;
    
    if (!name || !houseData || !materials || !totalCost || !totalCostWithWaste) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const calculation = await SimpleCalculationModel.createSimpleCalculation(
      userId,
      name,
      houseData,
      materials,
      totalCost,
      totalCostWithWaste,
      description,
      laborCosts
    );
    
    res.status(201).json(calculation);
  } catch (error) {
    console.error('Error creating calculation:', error);
    res.status(500).json({ error: 'Failed to create calculation' });
  }
};

export const deleteCalculation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const deleted = await SimpleCalculationModel.deleteSimpleCalculation(parseInt(id), userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    
    res.json({ message: 'Calculation deleted successfully' });
  } catch (error) {
    console.error('Error deleting calculation:', error);
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
};

export const shareCalculation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const shareId = randomUUID();
    const calculation = await SimpleCalculationModel.shareSimpleCalculation(parseInt(id), userId, shareId);
    
    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    res.json({ 
      shareId, 
      shareUrl: `${baseUrl}/api/public/simple-calculations/${shareId}` 
    });
  } catch (error) {
    console.error('Error sharing calculation:', error);
    res.status(500).json({ error: 'Failed to share calculation' });
  }
};

export const unshareCalculation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const unshared = await SimpleCalculationModel.unshareSimpleCalculation(parseInt(id), userId);
    
    if (!unshared) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    
    res.json({ message: 'Calculation unshared successfully' });
  } catch (error) {
    console.error('Error unsharing calculation:', error);
    res.status(500).json({ error: 'Failed to unshare calculation' });
  }
};

export const getPublicCalculation = async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    
    const calculation = await SimpleCalculationModel.getPublicSimpleCalculation(shareId);
    
    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }
    
    res.json(calculation);
  } catch (error) {
    console.error('Error fetching public calculation:', error);
    res.status(500).json({ error: 'Failed to fetch calculation' });
  }
};