import pool from '../db/connection';
import { Material } from '../types';

const mapDbToApi = (row: any): Material => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  categoryId: row.category_id,
  categoryName: row.category_name,
  description: row.description,
  createdAt: row.created_at,

  // ← Новые поля (в мм)
  width: row.width ?? undefined,
  height: row.height ?? undefined,
  nominalWidth : row.nominal_width ?? undefined,
  nominalHeight: row.nominal_height ?? undefined,
  defaultWasteFactor: row.default_waste_factor ?? undefined,
  latestPrice: row.latest_price ? parseFloat(row.latest_price) : null,
  latestSupplier: row.latest_supplier || null,
  latestPriceDate: row.latest_price_date || null,
});

export const getAllMaterials = async (): Promise<Material[]> => {
  const result = await pool.query(`
    WITH latest_prices AS (
      SELECT 
        mp.material_id,
        mp.price,
        mp.supplier,
        mp.date,
        ROW_NUMBER() OVER (PARTITION BY mp.material_id ORDER BY mp.date DESC) as rn
      FROM material_prices mp
    )
    SELECT 
      m.id, m.name, m.unit, m.category_id, mc.name as category_name,
      m.description, m.created_at,
      m.width, m.height, m.nominal_width, m.nominal_height, m.default_waste_factor,
      lp.price as latest_price,
        lp.supplier as latest_supplier,
        lp.date as latest_price_date
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    LEFT JOIN latest_prices lp ON m.id = lp.material_id AND lp.rn = 1
    ORDER BY m.id Desc
  `);
  return result.rows.map(mapDbToApi);
};

export const getMaterialById = async (id: string): Promise<Material | null> => {
  const result = await pool.query(`
    SELECT 
      m.id, m.name, m.unit, m.category_id, mc.name as category_name,
      m.description, m.created_at,
      m.width, m.height, m.nominal_width, m.nominal_height, m.default_waste_factor
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    WHERE m.id = $1
  `, [parseInt(id)]);
  const row = result.rows[0];
  return row ? mapDbToApi(row) : null;
};

export const createMaterial = async (
  material: Omit<Material, 'id' | 'createdAt'>
): Promise<Material> => {
  const {
    name,
    unit,
    categoryId,
    description,
    width,
    height,
    nominalWidth,
    nominalHeight,
    defaultWasteFactor,
  } = material;

  const result = await pool.query(`
    INSERT INTO materials (
      name, unit, category_id, description,
      width, height, nominal_width, nominal_height, default_waste_factor
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, name, unit, category_id, description, created_at,
              width, height, nominal_width, nominal_height, default_waste_factor
  `, [
    name,
    unit,
    categoryId || null,
    description || null,
    width || null,
    height || null,
    nominalWidth || null,
    nominalHeight || null,
    defaultWasteFactor || null,
  ]);

  return mapDbToApi(result.rows[0]);
};

export const updateMaterial = async (
  id: string,
  material: Partial<Omit<Material, 'id' | 'createdAt'>>
): Promise<Material | null> => {
  const {
    name,
    unit,
    categoryId,
    description,
    width,
    height,
    nominalWidth,
    nominalHeight,
    defaultWasteFactor,
  } = material;

  const result = await pool.query(`
    UPDATE materials
    SET name = COALESCE($1, name),
        unit = COALESCE($2, unit),
        category_id = COALESCE($3, category_id),
        description = COALESCE($4, description),
        width = COALESCE($5, width),
        height = COALESCE($6, height),
        nominal_width = COALESCE($7, nominal_width),
        nominal_height = COALESCE($8, nominal_height),
        default_waste_factor = COALESCE($9, default_waste_factor)
    WHERE id = $10
    RETURNING id, name, unit, category_id, description, created_at,
              width, height, nominal_width, nominal_height,  default_waste_factor
  `, [
    name,
    unit,
    categoryId || null,
    description || null,
    width || null,
    height || null,
    nominalWidth || null,
    nominalHeight || null,
    defaultWasteFactor || null,
    parseInt(id)
  ]);

  if (result.rows.length === 0) return null;

  return mapDbToApi(result.rows[0]);
};

export const deleteMaterial = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM materials WHERE id = $1', [parseInt(id)]);
  return result.rowCount !== 0;
};

export const getMaterialsForSelect = async (): Promise<{ id: string; name: string; categoryName?: string; description?: string }[]> => {
  const result = await pool.query(`
    SELECT m.id, m.name, mc.name as category_name, m.description
    FROM materials m
    LEFT JOIN material_categories mc ON m.category_id = mc.id
    ORDER BY m.name
  `);
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    categoryName: row.category_name,
    description: row.description,
  }));
};