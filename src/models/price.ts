import pool from "../db/connection";
import { MaterialPrice } from "../types";

// export const getAllPrices = async (): Promise<MaterialPrice[]> => {
//   const result = await pool.query(`
//     SELECT mp.id, mp.material_id, m.name as material_name, mp.price, mp.supplier, mp.date 
//     FROM material_prices mp
//     LEFT JOIN materials m ON mp.material_id = m.id
//     ORDER BY mp.date DESC
//   `);

//   return result.rows.map(row => ({
//     id: row.id,
//     materialId: row.material_id.toString(),
//     materialName: row.material_name,
//     price: parseFloat(row.price),
//     supplier: row.supplier,
//     date: row.date,
//   }));
// };

export const getAllPrices = async (
  page: number = 1, 
  pageSize: number = 10,
  materialId?: string,
  date?: string, // YYYY-MM-DD
  latestOnly: boolean = false // ← новый параметр
) => {
  let sql = '';
  
  if (latestOnly) {
    // Запрос для получения только последних цен по каждому материалу
    sql = `
      WITH ranked_prices AS (
        SELECT 
          mp.id, 
          mp.material_id, 
          m.name as material_name, 
          mp.price, 
          mp.supplier, 
          mp.date,
          ROW_NUMBER() OVER (PARTITION BY mp.material_id ORDER BY mp.date DESC) as rn
        FROM material_prices mp
        LEFT JOIN materials m ON mp.material_id = m.id
        WHERE 1=1
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    if (materialId) {
      conditions.push(`mp.material_id = $${paramIndex}`);
      params.push(parseInt(materialId));
      paramIndex++;
    }
    
    if (date) {
      conditions.push(`DATE(mp.date) = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      sql += ` AND ${conditions.join(' AND ')}`;
    }
    
    sql += `
      )
      SELECT id, material_id, material_name, price, supplier, date
      FROM ranked_prices
      WHERE rn = 1
      ORDER BY material_name
    `;
    
    // Для последних цен не нужна пагинация через LIMIT/OFFSET
    // Но мы можем применить её поверх CTE
    const paginatedSql = `${sql} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, (page - 1) * pageSize);
    
    const result = await pool.query(paginatedSql, params);
    
    // Для подсчёта общего количества последних цен
    const countSql = `
      SELECT COUNT(DISTINCT mp.material_id) as total
      FROM material_prices mp
      LEFT JOIN materials m ON mp.material_id = m.id
      WHERE 1=1
    `;
    
    const countConditions = [];
    const countParams = [];
    let countParamIndex = 1;
    
    if (materialId) {
      countConditions.push(`mp.material_id = $${countParamIndex}`);
      countParams.push(parseInt(materialId));
      countParamIndex++;
    }
    
    if (date) {
      countConditions.push(`DATE(mp.date) = $${countParamIndex}`);
      countParams.push(date);
      countParamIndex++;
    }
    
    const finalCountSql = countConditions.length > 0 
      ? `${countSql} AND ${countConditions.join(' AND ')}` 
      : countSql;
    
    const countResult = await pool.query(finalCountSql, countParams);
    
    return {
      data: result.rows.map(row => ({
        id: row.id,
        materialId: row.material_id.toString(),
        materialName: row.material_name,
        price: parseFloat(row.price),
        supplier: row.supplier,
        date: row.date,
      })),
      total: parseInt(countResult.rows[0].total),
    };
  } else {
    // Старая логика с пагинацией
    sql = `
      SELECT mp.id, mp.material_id, m.name as material_name, mp.price, mp.supplier, mp.date
      FROM material_prices mp
      LEFT JOIN materials m ON mp.material_id = m.id
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (materialId) {
      conditions.push(`mp.material_id = $${paramIndex}`);
      params.push(parseInt(materialId));
      paramIndex++;
    }

    if (date) {
      conditions.push(`DATE(mp.date) = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY mp.date DESC`;

    const countSql = `SELECT COUNT(*) as total FROM material_prices mp ${conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''}`;
    const countResult = await pool.query(countSql, conditions.length > 0 ? params.slice(0, conditions.length) : []);

    const offset = (page - 1) * pageSize;
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(sql, params);
    
    return {
      data: result.rows.map(row => ({
        id: row.id,
        materialId: row.material_id.toString(),
        materialName: row.material_name,
        price: parseFloat(row.price),
        supplier: row.supplier,
        date: row.date,
      })),
      total: parseInt(countResult.rows[0].total),
    };
  }
};

export const getPricesByMaterialId = async (materialId: string): Promise<MaterialPrice[]> => {
  const result = await pool.query(`
    SELECT mp.id, mp.material_id, m.name as material_name, mp.price, mp.supplier, mp.date 
    FROM material_prices mp
    LEFT JOIN materials m ON mp.material_id = m.id
    WHERE mp.material_id = $1 
    ORDER BY mp.date ASC
  `, [parseInt(materialId)]);
  return result.rows.map(row => ({
    id: row.id,
    materialId: row.material_id.toString(),
    materialName: row.material_name,
    price: parseFloat(row.price),
    supplier: row.supplier,
    date: row.date,
  }));
};

export const getPriceById = async (id: string): Promise<MaterialPrice | null> => {
  const result = await pool.query(`
    SELECT mp.id, mp.material_id, m.name as material_name, mp.price, mp.supplier, mp.date 
    FROM material_prices mp
    LEFT JOIN materials m ON mp.material_id = m.id
    WHERE mp.id = $1
  `, [parseInt(id)]);
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    materialId: row.material_id.toString(),
    materialName: row.material_name,
    price: parseFloat(row.price),
    supplier: row.supplier,
    date: row.date,
  };
};

export const createPrice = async (price: Omit<MaterialPrice, 'id'>): Promise<MaterialPrice> => {
  const { materialId, price: value, supplier } = price;
  const result = await pool.query(`
    WITH inserted AS (
      INSERT INTO material_prices (material_id, price, supplier) 
      VALUES ($1, $2, $3) 
      RETURNING id, material_id, price, supplier, date
    )
    SELECT i.id, i.material_id, m.name as material_name, i.price, i.supplier, i.date
    FROM inserted i
    LEFT JOIN materials m ON i.material_id = m.id
  `, [
    parseInt(materialId || ""),
    value, 
    supplier, 
  ]);
  
  const row = result.rows[0];
  return {
    id: row.id,
    materialId: row.material_id.toString(),
    materialName: row.material_name,
    price: parseFloat(row.price),
    supplier: row.supplier,
    date: row.date,
  };
};

export const updatePrice = async (id: string, price: Partial<Omit<MaterialPrice, 'id'>>): Promise<MaterialPrice | null> => {
  const { materialId, price: value, supplier, date } = price;
  const result = await pool.query(`
    UPDATE material_prices mp
    SET material_id = COALESCE($1, mp.material_id),
        price = COALESCE($2, mp.price),
        supplier = COALESCE($3, mp.supplier)
    FROM materials m
    WHERE mp.id = $4 AND mp.material_id = m.id
    RETURNING mp.id, mp.material_id, m.name as material_name, mp.price, mp.supplier, mp.date
  `, [
    materialId !== undefined ? parseInt(materialId) : null,
    value, 
    supplier, 
    parseInt(id)
  ]);
  
  const row = result.rows[0];
  if (!row) return null;
  
  return {
    id: row.id,
    materialId: row.material_id.toString(),
    materialName: row.material_name,
    price: parseFloat(row.price),
    supplier: row.supplier,
    date: row.date,
  };
};

export const deletePrice = async (id: string): Promise<boolean> => {
  const result = await pool.query('DELETE FROM material_prices WHERE id = $1', [id]);
  return result.rowCount !== 0;
};

