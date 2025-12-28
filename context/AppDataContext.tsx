
import { useUser, LocalUser } from './UserContext';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { getAllHabitTemplates, getHabitCompletionsForHeatmap, HabitCompletion, toggleHabitCompletion } from '../database/habits';
import { useGamification, UserStats } from '../hooks/useGamification';
import { useMetricSettings, Metric } from '../hooks/useMetricSettings';
import { useDailyLogs } from '../hooks/useDailyLogs';
import { getTodayLocal } from '../utils/date';
import { addMetricLog, getAllMetricLogs, MetricLog } from '../database/metrics';
import { DailyLog } from '../types';

interface AppData {
  habits: { id: string; title: string }[];
  completions: HabitCompletion[];
  metricLogs: MetricLog[];
  stats: UserStats;
  metrics: Metric[];
  dailyLogs: Record<string, DailyLog>;
  user: LocalUser | null;
  loading: boolean;
  refreshAllData: () => void;
  toggleHabitAndUpdate: (habitId: string, date: string, completed: boolean) => void;
  updateMetricAndUpdate: (metricId: string, date: string, value: number) => Promise<void>;
}

const AppDataContext = createContext<AppData | undefined>(undefined);

export const AppDataProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<{ id: string; title: string }[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [metricLogs, setMetricLogs] = useState<MetricLog[]>([]);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [focusOfTheDay, setFocusOfTheDay] = useState<string>('');
  
  const { user } = useUser();
  const { stats, onTaskCompleted, refreshStats } = useGamification();
  const { metrics, loading: loadingMetrics } = useMetricSettings();
  const { dailyLogs, loading: loadingLogs } = useDailyLogs();

  const today = getTodayLocal();

  const refreshAllData = useCallback(async () => {
    setLoading(true);
    const db = getDB();
    try {
      const habitTemplates = await getAllHabitTemplates();
      setHabits(habitTemplates);

      const completionPromises = habitTemplates.map(habit => getHabitCompletionsForHeatmap(habit.id, 21));
      const allCompletions = (await Promise.all(completionPromises)).flat();
      setCompletions(allCompletions);

      const allMetricLogs = await getAllMetricLogs();
      setMetricLogs(allMetricLogs);

      let logResult = await db.getFirstAsync('SELECT * FROM daily_logs WHERE date = ?', [today]) as { metrics: string, focus: string } | null;
      if (logResult) {
        setFocusOfTheDay(logResult.focus || '');
      }

      const goalsResult = await db.getAllAsync('SELECT * FROM goals WHERE completed = 0 LIMIT 3');
      setActiveGoals(goalsResult);


      await refreshStats();
    } catch (error) {
      console.error("Error refreshing global state:", error);
    } finally {
      setLoading(false);
    }
  }, [refreshStats, today]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const toggleHabitAndUpdate = useCallback(async (habitId: string, date: string, completed: boolean) => {
    // Optimistic UI update
    setCompletions(prev => {
      const newCompletions = [...prev];
      const completionIndex = newCompletions.findIndex(c => c.habit_id === habitId && c.date === date);
      if (completionIndex > -1) {
        newCompletions[completionIndex] = { ...newCompletions[completionIndex], completed: completed ? 1 : 0 };
      } else {
        newCompletions.push({ habit_id: habitId, date: date, completed: completed ? 1 : 0 });
      }
      return newCompletions;
    });

    // DB and gamification update
    toggleHabitCompletion(habitId, date, completed);
    // Only trigger gamification for today's tasks
    if (date === today) {
      await onTaskCompleted();
    }
  }, [today, onTaskCompleted]);

  const updateMetricAndUpdate = useCallback(async (metricId: string, date: string, value: number) => {
    // Optimistic UI update
    setMetricLogs(prev => {
        const newLogs = [...prev];
        const logIndex = newLogs.findIndex(l => l.metric_id === metricId && l.date === date);
        if (logIndex > -1) {
            newLogs[logIndex] = { ...newLogs[logIndex], value };
        } else {
            newLogs.push({ id: (Math.random() * 1e17).toString(), metric_id: metricId, date: date, value });
        }
        return newLogs;
    });

    // DB and gamification update
    addMetricLog(metricId, date, value);
    if (date === today) {
      await onTaskCompleted();
    }
  }, [today, onTaskCompleted]);

  const value = {
    user,
    habits,
    completions,
    metricLogs,
    stats,
    metrics,
    dailyLogs,
    loading: loading || loadingMetrics || loadingLogs,
    activeGoals,
    focusOfTheDay,
    refreshAllData,
    toggleHabitAndUpdate,
    updateMetricAndUpdate,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
};


