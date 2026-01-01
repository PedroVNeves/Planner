

import { getDB } from '.';
import { subDays, format } from 'date-fns';
import * as Crypto from 'expo-crypto';

const db = getDB();

export type HabitCompletion = {
  habit_id: string;
  date: string;
  completed: number;
};

export type Habit = {
  id: string;
  title: string;
  color: string;
  frequency: string; // JSON string like "[0,1,2]"
};

export const addHabitTemplate = async (title: string, color: string = '#8B5CF6', frequency: number[] = [0,1,2,3,4,5,6]) => {
  const id = Crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const frequencyStr = JSON.stringify(frequency);

  const query = `
    INSERT INTO habit_templates (id, title, color, frequency, createdAt, archived)
    VALUES (?, ?, ?, ?, ?, 0);
  `;
  try {
    await db.runAsync(query, [id, title, color, frequencyStr, createdAt]);
    return id;
  } catch (error) {
    console.error('Erro ao adicionar hábito:', error);
    return null;
  }
};

export const updateHabitTemplate = async (id: string, title: string, color: string, frequency: number[]) => {
  const frequencyStr = JSON.stringify(frequency);
  const query = `
    UPDATE habit_templates
    SET title = ?, color = ?, frequency = ?
    WHERE id = ?;
  `;
  try {
    await db.runAsync(query, [title, color, frequencyStr, id]);
  } catch (error) {
    console.error(`Erro ao atualizar hábito ${id}:`, error);
  }
};

export const archiveHabitTemplate = async (id: string) => {
  const query = `
    UPDATE habit_templates
    SET archived = 1
    WHERE id = ?;
  `;
  try {
    await db.runAsync(query, [id]);
  } catch (error) {
    console.error(`Erro ao arquivar hábito ${id}:`, error);
  }
};

export const toggleHabitCompletion = async (habitId: string, date: string, completed: boolean) => {
  const query = `
    INSERT INTO habit_completions (habit_id, date, completed)
    VALUES (?, ?, ?)
    ON CONFLICT(habit_id, date) DO UPDATE SET
    completed = excluded.completed;
  `;
  try {
    await db.runAsync(query, [habitId, date, completed ? 1 : 0]);
  } catch (error) {
    console.error(`Erro ao alternar conclusão do hábito ${habitId}:`, error);
  }
};

export const getAllHabitTemplates = async (): Promise<Habit[]> => {
  const query = `
    SELECT id, title, color, frequency
    FROM habit_templates
    WHERE archived = 0
    ORDER BY createdAt DESC;
  `;
  try {
    const results = await db.getAllAsync<Habit>(query);
    return results;
  } catch (error) {
    console.error('Erro ao buscar templates de hábitos:', error);
    return [];
  }
};

export const getHabitCompletionsForHeatmap = async (habitId: string, days: number): Promise<HabitCompletion[]> => {
  const today = new Date();
  const startDate = subDays(today, days - 1);
  const startDateString = format(startDate, 'yyyy-MM-dd');

  const query = `
    SELECT *
    FROM habit_completions
    WHERE habit_id = ? AND date >= ?
    ORDER BY date ASC;
  `;
  try {
    const results = await db.getAllAsync<HabitCompletion>(query, [habitId, startDateString]);
    return results;
  } catch (error) {
    console.error(`Erro ao buscar conclusões do hábito ${habitId}:`, error);
    return [];
  }
};
