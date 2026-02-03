import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createUser, getUserByEmail } from '../models/user';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email, password } = parsed.data;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email, }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    res.json({
      token,
      user: { 
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
       },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};


export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    const { email, password, firstName, lastName } = parsed.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = await createUser({
      email, password, firstName, lastName,
      role: 'user'
    });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};
export const getProfile = (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });
};