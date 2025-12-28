import { useState, useCallback } from 'react';
import { getDB } from '../database';
import { eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns';

/**
 * A hook to fetch the history of completed task days within a given date range.
 * This is used for building calendar-based streak visualizations.
 */
export const useStreakHistory = () => {
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  /**
   * Fetches all dates between a start and end date where at least one task
   * was marked as completed.
   * @param startDate The start of the date range.
   * @param endDate The end of the date range.
   */
  const fetchHistory = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true);
    const db = getDB();
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    try {
      const results = await db.getAllAsync(
        `SELECT DISTINCT date FROM tasks WHERE completed = 1 AND date BETWEEN ? AND ?`,
        [startDateStr, endDateStr]
      );

      const dates = new Set(results.map((row: any) => row.date));
      setCompletedDays(dates);

    } catch (error) {
      console.error('Error fetching streak history:', error);
      setCompletedDays(new Set()); // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    completedDays,
    fetchHistory,
  };
};

/**
 * Generates an array of dates for a full month view, including padding
 * for days from the previous and next months to complete the calendar grid.
 * @param monthDate A date within the desired month.
 * @returns An array of date objects, each with a `date` (Date object) and `isCurrentMonth` (boolean).
 */
export const getMonthCalendarDays = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate));
    const end = endOfWeek(endOfMonth(monthDate));
    const month = monthDate.getMonth();

    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
        date: day,
        isCurrentMonth: day.getMonth() === month,
    }));
};
