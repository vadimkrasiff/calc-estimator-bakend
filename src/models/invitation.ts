import pool from '../db/connection';
import { generateToken } from '../utils/generateToken';

export interface Invitation {
  id: number;
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export const createInvitation = async (email: string): Promise<Invitation> => {
  const token = generateToken(32);
  const result = await pool.query(`
    INSERT INTO invitations (email, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '24 hours')
    RETURNING id, email, token, expires_at, used, created_at
  `, [email, token]);
  return result.rows[0];
};

export const getInvitationByToken = async (token: string): Promise<Invitation | null> => {
  const result = await pool.query(`
    SELECT id, email, token, expires_at, used, created_at
    FROM invitations
    WHERE token = $1 AND expires_at > NOW() AND used = FALSE
  `, [token]);
  return result.rows[0] || null;
};

export const markInvitationUsed = async (token: string): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE invitations
    SET used = TRUE
    WHERE token = $1
    RETURNING id
  `, [token]);
  return result.rows.length > 0;
};

export const cleanupExpiredInvitations = async (): Promise<number> => {
  const result = await pool.query(`
    DELETE FROM invitations
    WHERE expires_at < NOW()
  `);
  return result.rowCount || 0;
};