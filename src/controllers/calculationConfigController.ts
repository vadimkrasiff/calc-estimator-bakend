import { Request, Response } from 'express';
import * as CalculationConfigModel from '../models/сalculationConfig';
import { v4 as uuidv4 } from 'uuid';

// Получить все конфигурации пользователя
export const getUserConfigs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const configs = await CalculationConfigModel.getUserConfigs(userId);
    
    res.json(configs);
  } catch (error) {
    console.error('Error fetching user configs:', error);
    res.status(500).json({ error: 'Failed to fetch configurations' });
  }
};

// Получить конкретную конфигурацию
export const getConfigById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const config = await CalculationConfigModel.getConfigById(parseInt(id), userId);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
};

// Создать новую конфигурацию
export const createConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, data } = req.body;
    
    if (!name || !data) {
      return res.status(400).json({ error: 'Name and data are required' });
    }
    
    const config = await CalculationConfigModel.createConfig(userId, name, data, description);
    
    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating config:', error);
    res.status(500).json({ error: 'Failed to create configuration' });
  }
};

// Обновить конфигурацию
export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { name, description, data } = req.body;
    
    const config = await CalculationConfigModel.updateConfig(
      parseInt(id),
      userId,
      name,
      data,
      description
    );
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
};

// Удалить конфигурацию
export const deleteConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const deleted = await CalculationConfigModel.deleteConfig(parseInt(id), userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({ error: 'Failed to delete configuration' });
  }
};

// Создать публичную ссылку
export const shareConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const shareId = uuidv4();
    const config = await CalculationConfigModel.shareConfig(parseInt(id), userId, shareId);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    res.json({ 
      shareId, 
      shareUrl: `${baseUrl}/api/public/calculations/${shareId}` 
    });
  } catch (error) {
    console.error('Error sharing config:', error);
    res.status(500).json({ error: 'Failed to share configuration' });
  }
};

// Отменить публикацию
export const unshareConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const config = await CalculationConfigModel.unshareConfig(parseInt(id), userId);
    
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    
    res.json({ message: 'Configuration unshared successfully' });
  } catch (error) {
    console.error('Error unsharing config:', error);
    res.status(500).json({ error: 'Failed to unshare configuration' });
  }
};

// Получить публичную конфигурацию
export const getSharedConfig = async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    
    const config = await CalculationConfigModel.getSharedConfig(shareId);
    
    if (!config) {
      return res.status(404).json({ error: 'Shared configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching shared config:', error);
    res.status(500).json({ error: 'Failed to fetch shared configuration' });
  }
};