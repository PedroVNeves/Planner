
import { useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { getDB } from '../database';
import { differenceInCalendarDays, subDays, parseISO } from 'date-fns';
import { getTodayLocal, formatDateLocal } from '../utils/date';

export interface UserStats {
  current_streak: number;
  last_completed_date: string | null;
  freeze_days: number;
}

export const useGamification = () => {
  const [stats, setStats] = useState<UserStats>({
    current_streak: 0,
    last_completed_date: null,
    freeze_days: 3,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const loadStats = useCallback(async () => {
    const db = getDB();
    try {
      const result = await db.getFirstAsync('SELECT * FROM user_stats WHERE id = ?', ['user']) as UserStats;
      if (result) {
        setStats(result);
      }
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateStatsInDB = useCallback(async (newStats: Partial<UserStats>) => {
    const updated = { ...stats, ...newStats };
    setStats(updated); // Optimistic UI update

    const db = getDB();
    try {
      await db.runAsync(
        `
        UPDATE user_stats 
        SET current_streak = ?, last_completed_date = ?, freeze_days = ?
        WHERE id = 'user'
      `,
        [updated.current_streak, updated.last_completed_date, updated.freeze_days]
      );
    } catch (e) {
      console.error('Error saving stats:', e);
    }
  }, [stats]);

  // Self-executing streak check on load
  useEffect(() => {
    const checkStreak = async () => {
      if (!isLoaded || !stats.last_completed_date) return;

      try {
        const today = new Date(getTodayLocal());
        const lastDate = parseISO(stats.last_completed_date);
        const diff = differenceInCalendarDays(today, lastDate);

        if (diff > 1) {
          const daysMissed = diff - 1;
          if (stats.freeze_days >= daysMissed) {
            // Use freeze days to save the streak
            const remainingLives = stats.freeze_days - daysMissed;
            // Bridge the gap by setting the last completed date to yesterday
            const yesterday = formatDateLocal(subDays(today, 1));
            await updateStatsInDB({
              freeze_days: remainingLives,
              last_completed_date: yesterday,
            });
            console.log(`Streak saved! Used ${daysMissed} freeze day(s).`);
          } else {
            // Not enough freeze days, reset the streak
            await updateStatsInDB({ current_streak: 0 });
            console.log('Streak lost! Not enough freeze days.');
          }
        }
      } catch (error) {
          console.error('Error parsing last_completed_date in useGamification:', error);
          console.error('The invalid date was:', stats.last_completed_date);
          // Failsafe: Reset streak due to corrupted date data
          await updateStatsInDB({ current_streak: 0 });
      }
    }
    checkStreak();
  }, [isLoaded]); // Depends on `isLoaded` to run after initial stats are loaded

  const onTaskCompleted = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const todayStr = getTodayLocal();
    
    // Use a function with setStats to get the most recent state
    setStats(currentStats => {
        if (currentStats.last_completed_date === todayStr) {
            console.log('Streak already updated for today.');
            return currentStats; // No change
        }

        let newStreak = currentStats.current_streak;
        const lastDate = currentStats.last_completed_date ? parseISO(currentStats.last_completed_date) : null;
        const today = new Date(todayStr);

        // Check if the last completion was yesterday to continue the streak
        if (lastDate && differenceInCalendarDays(today, lastDate) === 1) {
            newStreak += 1;
        } else {
            newStreak = 1; // Otherwise, reset to 1
        }
        
        let newFreeze = currentStats.freeze_days;
        // Grant a life every 7 days of streak (up to a max of 5)
        if (newStreak > 0 && newStreak % 7 === 0 && newFreeze < 5) {
            newFreeze += 1;
        }

        const updatedStats = {
            ...currentStats,
            current_streak: newStreak,
            last_completed_date: todayStr,
            freeze_days: newFreeze,
        };
        
        // Update DB
        const db = getDB();
        const updateDB = async () => {
            try {
                await db.runAsync(
                    `UPDATE user_stats SET current_streak = ?, last_completed_date = ?, freeze_days = ? WHERE id = 'user'`,
                    [updatedStats.current_streak, updatedStats.last_completed_date, updatedStats.freeze_days]
                );
            } catch (e) {
                console.error('Error saving stats:', e);
            }
        };
        updateDB();

        return updatedStats;
    });
  }, []);

  return {
    stats,
    onTaskCompleted,
    refreshStats: loadStats,
  };
};
