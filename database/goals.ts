import { getDB } from '../database';
import * as Crypto from 'expo-crypto';

const db = getDB();

export type GoalType = 'YEAR' | 'MONTH' | 'WEEK';

export interface Goal {
  id: string;
  description: string;
  type: GoalType;
  period: string; // '2025', '2025-01', '2025-W12'
  completed: number; // 0 or 1
  createdAt: string;
}

/**
 * Fetch goals for a specific period and type.
 */
export const getGoalsByPeriod = async (period: string): Promise<Goal[]> => {
  try {
    const result = await db.getAllAsync<Goal>(
      'SELECT * FROM goals WHERE period = ? ORDER BY createdAt DESC',
      [period]
    );
    return result;
  } catch (error) {
    console.error(`Error fetching goals for period ${period}:`, error);
    return [];
  }
};

/**
 * Add a new goal.
 */
export const addGoal = async (description: string, type: GoalType, period: string) => {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();

  try {
    await db.runAsync(
      'INSERT INTO goals (id, description, type, period, completed, createdAt) VALUES (?, ?, ?, ?, 0, ?)',
      [id, description, type, period, createdAt]
    );
    return id;
  } catch (error) {
    console.error('Error adding goal:', error);
    return null;
  }
};

/**
 * Toggle goal completion status.
 */
export const toggleGoalCompletion = async (id: string, completed: boolean) => {
  try {
    await db.runAsync(
      'UPDATE goals SET completed = ? WHERE id = ?',
      [completed ? 1 : 0, id]
    );
  } catch (error) {
    console.error(`Error toggling goal ${id}:`, error);
  }
};

/**
 * Delete a goal.
 */
export const deleteGoal = async (id: string) => {
  try {
    await db.runAsync('DELETE FROM goals WHERE id = ?', [id]);
  } catch (error) {
    console.error(`Error deleting goal ${id}:`, error);
  }
};

/**
 * Get summary counts for a whole year.
 */
export const getGoalCountsForYear = async (year: string) => {
  try {
    const query = `
      SELECT period, completed, count(*) as count 
      FROM goals 
      WHERE period LIKE ? 
      GROUP BY period, completed
    `;
    const result = await db.getAllAsync<{ period: string, completed: number, count: number }>(query, [`${year}%`]);
    
    const summary: Record<string, { total: number, completed: number }> = {};
    
    result.forEach(row => {
      if (!summary[row.period]) {
        summary[row.period] = { total: 0, completed: 0 };
      }
      summary[row.period].total += row.count;
      if (row.completed === 1) {
        summary[row.period].completed += row.count;
      }
    });
    
    return summary;
  } catch (error) {
    console.error('Error fetching goal counts:', error);
    return {};
  }
};