import pool from '../db/connection';
import bcrypt from 'bcryptjs';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const result = await pool.query(`
    SELECT id, email, first_name, last_name, role
    FROM users
    WHERE id = $1
  `, [parseInt(userId)]);
  
  const user = result.rows[0];
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
};

export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  const fields = [];
  const values = [];
  let paramIndex = 2;

  for (const [key, value] of Object.entries(profileData)) {
    if (value !== undefined) {
      fields.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    return getUserProfile(userId);
  }

  values.unshift(parseInt(userId)); // userId as $1


  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $1
    RETURNING id, email, first_name, last_name
  `;
console.log(query)
  const result = await pool.query(query, values);
  const user = result.rows[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
};

export const changeUserPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  // Get current password hash
  const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [parseInt(userId)]);
  const user = userResult.rows[0];
  if (!user) return false;

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return false;

  // Update password
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, parseInt(userId)]);
  return true;
};