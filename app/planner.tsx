import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme, ColorPalette } from '../theme';
import { useDailyLogs } from '../hooks/useDailyLogs';
import LoadingScreen from '../components/LoadingScreen';
import { getTodayLocal, getStartOfWeekLocal, generateWeekDays, parseDateLocal } from '../utils/date';
import { useGamification } from '../hooks/useGamification';
import { BentoGrid } from '../components/BentoGrid';
import { ThemeSelector } from '../components/ThemeSelector';
import { scheduleMorningNudge, scheduleStreakSaver, requestPermissions } from '../utils/notifications';

// --- Funções Utilitárias ---
const today = getTodayLocal();

const PlannerScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { dailyLogs, loadingLogs } = useDailyLogs();
  const { stats, onTaskCompleted, checkStreak } = useGamification();

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeekLocal(new Date()).getTime());

  useEffect(() => {
    requestPermissions();
    scheduleMorningNudge();
    scheduleStreakSaver();
    checkStreak();
  }, []);

  const styles = getDynamicStyles(theme);

  const weekDays = useMemo(() => {
    const start = new Date(currentWeekStart);
    const days = generateWeekDays(start);

    return days.map(day => ({
      ...day,
      log: dailyLogs[day.date],
    }));
  }, [currentWeekStart, dailyLogs]);

  const changeWeek = (direction: -1 | 1) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart.getTime());
  };

  const handleDayClick = (date: string) => {
    router.push(`/daily-detail/${date}`);
  };

  // Encontrar tarefa de foco (primeira tarefa não concluída de hoje)
  const todayLog = dailyLogs[today];
  const focusTask = todayLog?.tasks?.find((t: any) => !t.completed);

  const handleCompleteFocus = async () => {
    if (focusTask) {
      await onTaskCompleted();
    }
  };

  if (loadingLogs) {
    return <LoadingScreen message="A carregar planner..." theme={theme} />;
  }

  return (
    <>
      <Stack.Screen options={{
        title: 'Planner',
        headerShown: false,
      }} />

      <ScrollView
        style={styles.pageContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32, paddingTop: insets.top + 16 }}
      >
        {/* Header Customizado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Pedro!</Text>
            <Text style={styles.subGreeting}>Vamos fazer acontecer hoje.</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Streak Counter */}
            <View style={styles.streakBadge}>
              <Feather name="zap" size={16} color="#f59e0b" />
              <Text style={styles.streakText}>{stats.current_streak}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Feather name="settings" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento Grid Dashboard */}
        <BentoGrid focusTask={focusTask} onCompleteFocus={handleCompleteFocus} />

        {/* Navegação da Semana */}
        <View style={styles.weekNav}>
          <TouchableOpacity onPress={() => changeWeek(-1)} style={styles.weekArrow}>
            <Feather name="chevron-left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.weekTitle}>
            {parseDateLocal(weekDays[0].date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} -
            {' '}
            {parseDateLocal(weekDays[6].date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => changeWeek(1)} style={styles.weekArrow}>
            <Feather name="chevron-right" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Grelha dos Dias */}
        <View style={styles.weekGrid}>
          {weekDays.map(day => (
            <TouchableOpacity
              key={day.date}
              onPress={() => handleDayClick(day.date)}
              style={[styles.dayCell, day.date === today && styles.dayCellToday]}
            >
              <Text style={[styles.dayName, day.date === today && styles.dayTextToday]}>{day.dayName}</Text>
              <Text style={[styles.dayNumber, day.date === today && styles.dayTextToday]}>{parseDateLocal(day.date).getDate()}</Text>

              <View style={styles.dayIndicators}>
                {day.log?.tasks?.length > 0 && (
                  <View style={[styles.indicator, day.log.tasks.every((t: any) => t.completed) ? styles.indicatorGreen : styles.indicatorYellow]} />
                )}
                {Object.values(day.log?.metrics || {}).some(val => (val as number) > 0) && (
                  <View style={[styles.indicator, styles.indicatorBlue]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seletor de Temas */}
        <ThemeSelector />

      </ScrollView>
    </>
  );
};

const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  pageContainer: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  weekArrow: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dayCell: {
    flex: 1,
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: colors.border,
    height: 90,
  },
  dayCellToday: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayTextToday: {
    color: '#fff',
  },
  dayIndicators: {
    flexDirection: 'row',
    marginTop: 8,
  },
  indicator: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 2 },
  indicatorGreen: { backgroundColor: colors.accent },
  indicatorYellow: { backgroundColor: '#f59e0b' },
  indicatorBlue: { backgroundColor: colors.primary },
});

export default PlannerScreen;