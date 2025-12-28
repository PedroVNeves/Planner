
import { getDB } from '.';
import * as Crypto from 'expo-crypto';

export type MetricLog = {
  id: string;
  metric_id: string;
  date: string;
  value: number;
};

export const addMetricLog = async (metricId: string, date: string, value: number) => {
  const db = getDB();
  try {
    // Check if a log for this metric and date already exists
    const existingLog = await db.getFirstAsync(
      'SELECT id FROM metric_logs WHERE metric_id = ? AND date = ?',
      [metricId, date]
    );

    if (existingLog) {
      // If it exists, update it
      await db.runAsync(
        'UPDATE metric_logs SET value = ? WHERE id = ?',
        [value, existingLog.id]
      );
    } else {
      // If it does not exist, insert a new one
      const id = Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO metric_logs (id, metric_id, date, value) VALUES (?, ?, ?, ?)',
        [id, metricId, date, value]
      );
    }
  } catch (error) {
    console.error(`Erro ao adicionar log de métrica ${metricId}:`, error);
  }
};

export const getMetricLogsForDate = async (date: string): Promise<MetricLog[]> => {
  const db = getDB();
  const query = `
    SELECT *
    FROM metric_logs
    WHERE date = ?;
  `;
  try {
    const results = await db.getAllAsync(query, [date]);
    return results as MetricLog[];
  } catch (error) {
    console.error(`Erro ao buscar logs de métrica para a data ${date}:`, error);
    return [];
  }
};

export const getAllMetricLogs = async (): Promise<MetricLog[]> => {
    const db = getDB();
    const query = `
      SELECT *
      FROM metric_logs;
    `;
    try {
      const results = await db.getAllAsync(query);
      return results as MetricLog[];
    } catch (error) {
      console.error(`Erro ao buscar todos os logs de métrica:`, error);
      return [];
    }
};
