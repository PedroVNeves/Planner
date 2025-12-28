import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, UIManager, LayoutAnimation, Platform } from 'react-native';
import { startOfMonth, startOfWeek, endOfMonth, endOfWeek, format, eachDayOfInterval, getDate, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme, ColorPalette } from '../theme';
import { useStreakHistory } from '../hooks/useStreakHistory';
import { UserStats } from '../hooks/useGamification';
import { Feather } from '@expo/vector-icons';
import { getTodayLocal, formatDateLocal } from '../utils/date';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface StreakViewProps {
  stats: UserStats;
}

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const getMonthCalendarDays = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate), { locale: ptBR });
    const end = endOfWeek(endOfMonth(monthDate), { locale: ptBR });
    const currentMonth = getMonth(monthDate);

    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => ({
        date: day,
        isCurrentMonth: getMonth(day) === currentMonth,
    }));
};

export const StreakView: React.FC<StreakViewProps> = ({ stats }) => {
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);
  const { completedDays, fetchHistory, loading } = useStreakHistory();
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const todayStr = getTodayLocal();

  // Fetch history only when the calendar is opened
  useEffect(() => {
    if (isCalendarOpen) {
      const start = viewMode === 'week' ? startOfWeek(currentDate, { locale: ptBR }) : startOfMonth(currentDate);
      const end = viewMode === 'week' ? endOfWeek(currentDate, { locale: ptBR }) : endOfMonth(currentDate);
      fetchHistory(start, end);
    }
  }, [viewMode, currentDate, fetchHistory, isCalendarOpen]);
  
  const calendarDays = viewMode === 'week'
    ? eachDayOfInterval({ start: startOfWeek(currentDate, { locale: ptBR }), end: endOfWeek(currentDate, { locale: ptBR }) }).map(d => ({ date: d, isCurrentMonth: true }))
    : getMonthCalendarDays(currentDate);

  const toggleCalendar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggleCalendar}>
        <Text style={styles.title}>Ofensiva</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Feather name="zap" size={20} color={theme.primary} />
            <Text style={styles.statValue}>{stats.current_streak}</Text>
            <Text style={styles.statLabel}>Dias Seguidos</Text>
          </View>
          <View style={styles.statBox}>
            <Feather name="shield" size={20} color="#34d399" />
            <Text style={styles.statValue}>{stats.freeze_days}</Text>
            <Text style={styles.statLabel}>Vidas Restantes</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {isCalendarOpen && (
        <View>
          {/* View Mode Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
                onPress={() => setViewMode('month')} 
                style={[styles.toggleButton, viewMode === 'month' && styles.toggleButtonActive]}
            >
                <Text style={[styles.toggleText, viewMode === 'month' && styles.toggleTextActive]}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setViewMode('week')} 
                style={[styles.toggleButton, viewMode === 'week' && styles.toggleButtonActive]}
            >
                <Text style={[styles.toggleText, viewMode === 'week' && styles.toggleTextActive]}>Semana</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <View style={styles.weekDayHeader}>
              {WEEK_DAYS.map((day, index) => (
                <Text key={index} style={styles.weekDayText}>{day}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map(({ date, isCurrentMonth }, index) => {
                const dateStr = formatDateLocal(date);
                const isCompleted = completedDays.has(dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <View
                    key={index}
                    style={[
                      styles.dayCell,
                      isCompleted && styles.dayCellCompleted,
                      !isCurrentMonth && styles.dayCellNotInMonth,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      isCompleted && styles.dayTextCompleted,
                    ]}>
                      {getDate(date)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  calendarContainer: {},
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 4,
  },
  dayCellNotInMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  dayCellCompleted: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  dayTextToday: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextCompleted: {
      color: colors.accent,
      fontWeight: 'bold'
  },
});
