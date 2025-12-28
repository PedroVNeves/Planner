
// hooks/useGoals.ts
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { Goal, GoalType } from '../types';

const db = getDB();

const typeOrder: Record<GoalType, number> = {
  'YEAR': 1,
  'MONTH': 2,
  'WEEK': 3,
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const fetchGoals = useCallback(async () => {
    try {
      setLoadingGoals(true);
      const allRows = await db.getAllAsync<Goal>('SELECT * FROM goals');
      
      allRows.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

      setGoals(allRows);
    } catch (error) {
      console.error('Error fetching goals from SQLite:', error);
    } finally {
      setLoadingGoals(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (description: string, type: GoalType) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    try {
      await db.runAsync(
        'INSERT INTO goals (id, description, type, completed, createdAt) VALUES (?, ?, ?, 0, ?)',
        [id, description, type, createdAt]
      );
      fetchGoals(); // Re-fetch
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
        const existingGoal = goals.find(g => g.id === goalId);
        if (!existingGoal) return;

        const updatedGoal = { ...existingGoal, ...updates };

        await db.runAsync(
            `UPDATE goals SET description = ?, completed = ?, completedAt = ? WHERE id = ?`,
            [updatedGoal.description, updatedGoal.completed ? 1 : 0, updatedGoal.completedAt, goalId]
        );
        fetchGoals(); // Re-fetch
    } catch (error) {
        console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await db.runAsync('DELETE FROM goals WHERE id = ?', [goalId]);
      fetchGoals(); // Re-fetch
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };


  return { goals, loadingGoals, addGoal, updateGoal, deleteGoal, refreshGoals: fetchGoals };
};
