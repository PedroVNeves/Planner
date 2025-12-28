
import { getDB } from '.';

import { subDays, format } from 'date-fns';

import * as Crypto from 'expo-crypto';



const db = getDB();



export type HabitCompletion = {

  habit_id: string;

  date: string;

  completed: number;

};



/**

 * Adiciona um novo template de hábito.

 */

export const addHabitTemplate = async (title: string) => {

  const id = Crypto.randomUUID();

  const createdAt = new Date().toISOString();

  const query = `

    INSERT INTO habit_templates (id, title, createdAt)

    VALUES (?, ?, ?);

  `;

  try {

    await db.runAsync(query, [id, title, createdAt]);

    return id;

  } catch (error) {

    console.error('Erro ao adicionar hábito:', error);

    return null;

  }

};



/**

 * Atualiza o título de um template de hábito.

 */

export const updateHabitTemplate = async (id: string, title: string) => {

  const query = `

    UPDATE habit_templates

    SET title = ?

    WHERE id = ?;

  `;

  try {

    await db.runAsync(query, [title, id]);

  } catch (error) {

    console.error(`Erro ao atualizar hábito ${id}:`, error);

  }

};



/**

 * Arquiva um template de hábito.

 */

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



/**

 * Alterna a conclusão de um hábito para uma data específica.

 * Cria um novo registro se não existir.

 */

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



/**

 * Busca todos os templates de hábitos que não estão arquivados.

 * @returns Um array de objetos HabitTemplate

 */
export const getAllHabitTemplates = async (): Promise<{ id: string, title: string }[]> => {
  const query = `
    SELECT id, title
    FROM habit_templates
    WHERE archived = 0
    ORDER BY createdAt DESC;
  `;

  try {
    const results = await db.getAllAsync(query);
    return results as { id: string, title: string }[];
  } catch (error) {
    console.error('Erro ao buscar templates de hábitos:', error);
    return [];
  }
};


/**
 * Busca as conclusões de um hábito específico para os últimos N dias.
 * @param habitId ID do template do hábito
 * @param days Número de dias para buscar (ex: 21)
 * @returns Um array de objetos HabitCompletion
 */
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
    const results = await db.getAllAsync(query, [habitId, startDateString]);
    return results as HabitCompletion[];
  } catch (error) {
    console.error(`Erro ao buscar conclusões do hábito ${habitId}:`, error);
    return [];
  }
};
