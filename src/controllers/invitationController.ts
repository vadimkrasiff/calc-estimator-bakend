import { Request, Response } from 'express';
import { z } from 'zod';
import * as invitationModel from '../models/invitation';
import { sendInvitationEmail } from '../services/emailService';
import { cleanupExpiredInvitations } from '../models/invitation';

const inviteUserSchema = z.object({
  email: z.string().email(),
});

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const parsed = inviteUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email } = parsed.data;
    
    // Очистка истёкших приглашений
    await cleanupExpiredInvitations();

    // Создаём приглашение
    const invitation = await invitationModel.createInvitation(email);
    // Отправляем email
    await sendInvitationEmail(invitation, process.env.FRONTEND_URL || 'http://localhost:5173');

    res.json({
      message: 'Приглашение отправлено',
      email,
      expiresAt: invitation.expiresAt,
    });
  } catch (error: any) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

export const validateInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await invitationModel.getInvitationByToken(token);

    if (!invitation) {
      return res.status(400).json({ error: 'Неверный или истёкший токен приглашения' });
    }

    res.json({
      valid: true,
      email: invitation.email,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
};