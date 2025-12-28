
// hooks/useHabitSettings.tsx
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { Habit } from '../types';
import { Feather } from '@expo/vector-icons';

const db = getDB();

export const useHabitSettings = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      // The table is habit_templates, but we use the Habit interface
      const allRows = await db.getAllAsync<Habit>('SELECT id, title, archived, createdAt FROM habit_templates ORDER BY createdAt ASC');
      setHabits(allRows);
    } catch (error) {
      console.error('Error fetching habits from SQLite:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const addHabit = async (name: string, icon: React.ComponentProps<typeof Feather>['name']) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    try {
      // Note: The 'icon' is not in the habit_templates table schema you provided.
      // I am mapping 'name' to 'title'. If you need the icon, you'll have to add an 'icon' column to the table.
      await db.runAsync(
        'INSERT INTO habit_templates (id, title, archived, createdAt) VALUES (?, ?, 0, ?)',
        [id, name, createdAt]
      );
      fetchHabits(); // Re-fetch
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await db.runAsync('DELETE FROM habit_templates WHERE id = ?', [habitId]);
      fetchHabits(); // Re-fetch
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };
  
  const archiveHabit = async (habitId: string) => {
    try {
        await db.runAsync('UPDATE habit_templates SET archived = 1 WHERE id = ?', [habitId]);
        fetchHabits();
    } catch (error) {
        console.error('Error archiving habit:', error)
    }
  }

  return { habits, loading, addHabit, deleteHabit, archiveHabit, refreshHabits: fetchHabits };
};
