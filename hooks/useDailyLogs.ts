
// hooks/useDailyLogs.ts
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { DailyLog } from '../types';
import { useGamification } from './useGamification'; // Import useGamification

const db = getDB();

type DailyLogsMap = {
  [date: string]: DailyLog;
};

export const useDailyLogs = () => {
  const [dailyLogs, setDailyLogs] = useState<DailyLogsMap>({});
  const [loadingLogs, setLoadingLogs] = useState(true);
  const { onTaskCompleted } = useGamification(); // Use onTaskCompleted

  const fetchDailyLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const allRows = await db.getAllAsync<DailyLog>('SELECT * FROM daily_logs');
      const logsMap: DailyLogsMap = {};
      allRows.forEach(row => {
        logsMap[row.date] = row;
      });
      setDailyLogs(logsMap);
    } catch (error) {
      console.error('Error fetching daily logs from SQLite:', error);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchDailyLogs();
  }, [fetchDailyLogs]);

  const updateDailyLog = async (date: string, updates: Partial<Omit<DailyLog, 'date'>>) => {
    try {
      const existing = await db.getFirstAsync<DailyLog>('SELECT * FROM daily_logs WHERE date = ?', [date]);

      if (existing) {
        const updatedLog = { ...existing, ...updates };
        await db.runAsync(
          'UPDATE daily_logs SET focus = ?, metrics = ? WHERE date = ?',
          [updatedLog.focus, updatedLog.metrics, date]
        );
      } else {
        await db.runAsync(
          'INSERT INTO daily_logs (date, focus, metrics) VALUES (?, ?, ?)',
          [date, updates.focus ?? '', updates.metrics ?? '{}']
        );
      }
      fetchDailyLogs();
      
      // If metrics were updated, there was an interaction, so update the streak
      if(updates.metrics) {
        await onTaskCompleted();
      }

    } catch (error)      {
      console.error('Error updating daily log:', error);
    }
  }

  return { dailyLogs, loadingLogs, updateDailyLog, refreshDailyLogs: fetchDailyLogs };
};
