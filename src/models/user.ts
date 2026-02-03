import pool from '../db/connection';
import { User } from '../types';

const mapDbToApi = (row: any):  User => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  role: row.role,
  createdAt: row.created_at,
  password: row.password
});

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(`
    SELECT id, email, first_name, last_name, role, created_at
    FROM users
    ORDER BY created_at DESC
  `);
  return result.rows.map(mapDbToApi);
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query(`
    SELECT id, email, first_name, last_name, role, created_at
    FROM users
    WHERE id = $1
  `, [parseInt(id)]);
  return result.rows[0] ? mapDbToApi(result.rows[0]) : null;
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(`
    SELECT id, email, first_name, last_name, role, created_at, password
    FROM users
    WHERE email = $1
  `, [email]);
  return result.rows[0] ? mapDbToApi(result.rows[0]) : null;
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const { email, password, firstName, lastName, role } = userData;
  const result = await pool.query(`
    INSERT INTO users (email, password, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, role, created_at
  `, [email, password, firstName, lastName, role]);
  return mapDbToApi(result.rows[0]);
};

export const updateUser = async (id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> => {
  const { email, firstName, lastName, role } = userData;
  const result = await pool.query(`
    UPDATE users
    SET email = COALESCE($1, email),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        role = COALESCE($4, role)
    WHERE id = $5
    RETURNING id, email, first_name, last_name, role, created_at
  `, [email, firstName, lastName, role, parseInt(id)]);
  return result.rows[0] ? mapDbToApi(result.rows[0]) : null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [parseInt(id)]);
  return result.rowCount !== 0;
};