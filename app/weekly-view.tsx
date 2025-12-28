import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useTheme, ColorPalette } from '../theme';
import { useDailyLogs } from '../hooks/useDailyLogs';
import LoadingScreen from '../components/LoadingScreen';
import { getStartOfWeekLocal, generateWeekDays, parseDateLocal } from '../utils/date';

const WeeklyViewScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { dailyLogs, loadingLogs } = useDailyLogs();

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeekLocal(new Date()).getTime());

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

  if (loadingLogs) {
    return <LoadingScreen message="A carregar vista semanal..." theme={theme} />;
  }

  return (
    <>
      <Stack.Screen options={{
        title: 'Visão Semanal',
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }} />

      <ScrollView
        style={styles.pageContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: 16 }}
      >
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
              style={styles.dayCell}
            >
              <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day.dayName.toUpperCase()}</Text>
                  <Text style={styles.dayNumber}>{parseDateLocal(day.date).getDate()}</Text>
              </View>
              
              {/* Aqui pode adicionar mais detalhes do dia, como tarefas */}
              <View style={styles.dayContent}>
                 {day.log?.tasks?.slice(0, 3).map((task: any) => (
                     <Text key={task.id} style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                         - {task.title}
                     </Text>
                 ))}
                 {day.log?.tasks?.length > 3 && <Text style={styles.moreTasksText}>...</Text>}
              </View>

            </TouchableOpacity>
          ))}
        </View>

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
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
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
    flex: 1,
  },
  dayCell: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12
  },
  dayName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
    width: 40,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dayContent: {
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: colors.border,
  },
  taskText: {
      color: colors.textSecondary,
      fontSize: 12,
  },
  taskTextCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
      opacity: 0.5,
  },
  moreTasksText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontStyle: 'italic',
  }
});

export default WeeklyViewScreen;
