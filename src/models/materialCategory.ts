import pool from '../db/connection';
import { MaterialCategory } from '../types';

export const getAllCategories = async (): Promise<MaterialCategory[]> => {
  const result = await pool.query(`
    SELECT id, name, description, created_at
    FROM material_categories
    ORDER BY name
  `);
  
  
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  }));
};

export const getCategoryById = async (id: string): Promise<MaterialCategory | null> => {
  const result = await pool.query(`
    SELECT id, name, description, created_at
    FROM material_categories
    WHERE id = $1
  `, [parseInt(id)]);
  const row = result.rows[0];
  return row ? {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  } : null;
};

export const createCategory = async (category: Omit<MaterialCategory, 'id' | 'createdAt'>): Promise<MaterialCategory> => {
  const { name, description } = category;
  const result = await pool.query(`
    INSERT INTO material_categories (name, description)
    VALUES ($1, $2)
    RETURNING id, name, description, created_at
  `, [name, description]);
  
  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    description: result.rows[0].description,
    createdAt: result.rows[0].created_at,
  };
};

export const updateCategory = async (
  id: string, 
  category: Partial<Omit<MaterialCategory, 'id' | 'createdAt'>>
): Promise<MaterialCategory | null> => {
  const { name, description } = category;
  const result = await pool.query(`
    UPDATE material_categories
    SET name = COALESCE($1, name),
        description = COALESCE($2, description)
    WHERE id = $3
    RETURNING id, name, description, created_at
  `, [name, description, parseInt(id)]);
  
  if (result.rows.length === 0) return null;
  
  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    description: result.rows[0].description,
    createdAt: result.rows[0].created_at,
  };
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM material_categories WHERE id = $1', [parseInt(id)]);
  return result.rowCount !== 0;
};