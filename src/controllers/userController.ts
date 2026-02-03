import { Request, Response } from 'express';
import { z } from 'zod';
import * as userModel from '../models/user';
import bcrypt from 'bcryptjs';
import * as invitationModel from '../models/invitation';

const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['user', 'admin']),
});

const createUserSchema = userSchema.extend({
  password: z.string().min(6),
});

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email, password, firstName, lastName, role } = parsed.data;
    
    // Проверяем, существует ли пользователь
    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      role,
    });

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = userSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const updated = await userModel.updateUser(id, parsed.data);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password: _, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await userModel.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Приглашение пользователя (заглушка)
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Проверяем формат email
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // TODO: Реализовать отправку приглашения по email
    // 1. Создать токен приглашения
    // 2. Отправить email с ссылкой регистрации
    // 3. Сохранить токен в базе
    
    res.json({ message: 'Invitation sent successfully', email });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
};

export const createUserWithInvitation = async (req: Request, res: Response) => {
  try {
    const parsed = z.object({
      invitationToken: z.string(),
      password: z.string().min(6),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }).safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { invitationToken, password, firstName, lastName } = parsed.data;

    // Проверяем токен приглашения
    const invitation = await invitationModel.getInvitationByToken(invitationToken);
    if (!invitation) {
      return res.status(400).json({ error: 'Неверный или истёкший токен приглашения' });
    }

    // Хешируем пароль
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const newUser = await userModel.createUser({
      email: invitation.email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      role: 'user', // по умолчанию обычный пользователь
    });

    // Отмечаем приглашение как использованное
    await invitationModel.markInvitationUsed(invitationToken);

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};