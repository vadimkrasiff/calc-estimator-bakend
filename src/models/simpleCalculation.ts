import pool from '../db/connection';

export interface SimpleCalculation {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  house_data: any;
  materials: any[];
  labor_costs?: any[];
  total_cost: number;
  total_cost_with_waste: number;
  is_public: boolean;
  share_id?: string;
  created_at: string;
  updated_at: string;
}

export const createSimpleCalculation = async (
  userId: number,
  name: string,
  houseData: any,
  materials: any[],
  totalCost: number,
  totalCostWithWaste: number,
  description?: string,
  laborCosts?: any[]
): Promise<SimpleCalculation> => {
  const result = await pool.query(`
    INSERT INTO simple_calculations 
      (user_id, name, description, house_data, materials, labor_costs, total_cost, total_cost_with_waste)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, user_id, name, description, house_data, materials, labor_costs, 
              total_cost, total_cost_with_waste, is_public, share_id, created_at, updated_at
  `, [userId, name, description || null, JSON.stringify(houseData), JSON.stringify(materials), 
      laborCosts ? JSON.stringify(laborCosts) : null, totalCost, totalCostWithWaste]);
  return result.rows[0];
};

export const getUserSimpleCalculations = async (userId: number): Promise<SimpleCalculation[]> => {
  const result = await pool.query(`
    SELECT id, user_id, name, description, total_cost, total_cost_with_waste, 
           is_public, share_id, created_at, updated_at
    FROM simple_calculations
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `, [userId]);
  return result.rows;
};

export const getSimpleCalculationById = async (id: number, userId: number): Promise<SimpleCalculation | null> => {
  const result = await pool.query(`
    SELECT id, user_id, name, description, house_data, materials, labor_costs,
           total_cost, total_cost_with_waste, is_public, share_id, created_at, updated_at
    FROM simple_calculations
    WHERE id = $1 AND user_id = $2
  `, [id, userId]);
  return result.rows[0] || null;
};

export const shareSimpleCalculation = async (id: number, userId: number, shareId: string): Promise<SimpleCalculation | null> => {
  const result = await pool.query(`
    UPDATE simple_calculations
    SET is_public = TRUE, share_id = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, share_id, is_public
  `, [shareId, id, userId]);
  return result.rows[0] || null;
};

export const unshareSimpleCalculation = async (id: number, userId: number): Promise<boolean> => {
  const result = await pool.query(`
    UPDATE simple_calculations
    SET is_public = FALSE, share_id = NULL, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [id, userId]);
  return result.rows.length > 0;
};

export const deleteSimpleCalculation = async (id: number, userId: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM simple_calculations
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [id, userId]);
  return result.rows.length > 0;
};

export const getPublicSimpleCalculation = async (shareId: string): Promise<SimpleCalculation | null> => {
  const result = await pool.query(`
    SELECT id, name, description, house_data, materials, labor_costs,
           total_cost, total_cost_with_waste, created_at
    FROM simple_calculations
    WHERE share_id = $1 AND is_public = TRUE
  `, [shareId]);
  return result.rows[0] || null;
};