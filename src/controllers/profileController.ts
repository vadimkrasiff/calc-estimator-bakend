import { Request, Response } from 'express';
import { z } from 'zod';
import * as profileModel from '../models/profile';

const profileUpdateSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  company: z.string().max(100).optional(),
  position: z.string().max(50).optional(),
});

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    console.log(userId)
    const profile = await profileModel.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const updatedProfile = await profileModel.updateUserProfile(userId, parsed.data);
    if (!updatedProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedProfile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    const passwordChangeSchema = z.object({
      currentPassword: z.string().min(6),
      newPassword: z.string().min(6),
    });

    const parsed = passwordChangeSchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const success = await profileModel.changeUserPassword(userId, currentPassword, newPassword);
    if (!success) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};