import pool from '../db/connection';

export interface CalculationConfig {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  data: any; // JSON данные
  is_public: boolean;
  share_id?: string;
  created_at: string;
  updated_at: string;
}

// Создание таблицы (запустить один раз)
export const createCalculationConfigsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calculation_configs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      data JSONB NOT NULL,
      is_public BOOLEAN DEFAULT FALSE,
      share_id VARCHAR(36) UNIQUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_configs_user_id ON calculation_configs(user_id);
    CREATE INDEX IF NOT EXISTS idx_configs_share_id ON calculation_configs(share_id);
    CREATE INDEX IF NOT EXISTS idx_configs_created_at ON calculation_configs(created_at DESC);
  `);
};

// Получить все конфигурации пользователя
export const getUserConfigs = async (userId: number): Promise<CalculationConfig[]> => {
  const result = await pool.query(`
    SELECT id, user_id, name, description, is_public, share_id, created_at, updated_at
    FROM calculation_configs
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `, [userId]);
  return result.rows;
};

// Получить конкретную конфигурацию по ID
export const getConfigById = async (id: number, userId: number): Promise<CalculationConfig | null> => {
  const result = await pool.query(`
    SELECT id, user_id, name, description, data, is_public, share_id, created_at, updated_at
    FROM calculation_configs
    WHERE id = $1 AND user_id = $2
  `, [id, userId]);
  return result.rows[0] || null;
};

// Создать новую конфигурацию
export const createConfig = async (
  userId: number,
  name: string,
  data: any,
  description?: string
): Promise<CalculationConfig> => {
  const result = await pool.query(`
    INSERT INTO calculation_configs (user_id, name, description, data)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, name, description, data, is_public, share_id, created_at, updated_at
  `, [userId, name, description || null, JSON.stringify(data)]);
  return result.rows[0];
};

// Обновить конфигурацию
export const updateConfig = async (
  id: number,
  userId: number,
  name: string,
  data: any,
  description?: string
): Promise<CalculationConfig | null> => {
  const result = await pool.query(`
    UPDATE calculation_configs
    SET name = $1, description = $2, data = $3, updated_at = NOW()
    WHERE id = $4 AND user_id = $5
    RETURNING id, user_id, name, description, data, is_public, share_id, created_at, updated_at
  `, [name, description || null, JSON.stringify(data), id, userId]);
  return result.rows[0] || null;
};

// Удалить конфигурацию
export const deleteConfig = async (id: number, userId: number): Promise<boolean> => {
  const result = await pool.query(`
    DELETE FROM calculation_configs
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `, [id, userId]);
  return result.rows.length > 0;
};

// Создать публичную ссылку
export const shareConfig = async (id: number, userId: number, shareId: string): Promise<CalculationConfig | null> => {
  const result = await pool.query(`
    UPDATE calculation_configs
    SET is_public = TRUE, share_id = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, name, description, is_public, share_id, created_at, updated_at
  `, [shareId, id, userId]);
  return result.rows[0] || null;
};

// Отменить публикацию
export const unshareConfig = async (id: number, userId: number): Promise<CalculationConfig | null> => {
  const result = await pool.query(`
    UPDATE calculation_configs
    SET is_public = FALSE, share_id = NULL, updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, name, description, is_public, share_id, created_at, updated_at
  `, [id, userId]);
  return result.rows[0] || null;
};

// Получить публичную конфигурацию по shareId
export const getSharedConfig = async (shareId: string): Promise<CalculationConfig | null> => {
  const result = await pool.query(`
    SELECT id, name, description, data, created_at, updated_at
    FROM calculation_configs
    WHERE share_id = $1 AND is_public = TRUE
  `, [shareId]);
  return result.rows[0] || null;
};

// Очистить старые непубличные конфигурации (опционально)
export const cleanupOldConfigs = async (daysOld: number = 30): Promise<number> => {
  const result = await pool.query(`
    DELETE FROM calculation_configs
    WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    AND is_public = FALSE
  `);
  return result.rowCount || 0;
};