import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Vibration, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { useAppData } from '../../context/AppDataContext';
import { getStartOfWeekLocal, generateWeekDays, parseDateLocal, getTodayLocal } from '../../utils/date';

import { BentoGrid } from '../../components/BentoGrid';
import { MetricInput } from '../../components/MetricInput';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';
import { StreakView } from '../../components/StreakView';
import HabitTracker from '../../components/HabitTracker';

const today = getTodayLocal();

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const {
    user,
    habits,
    completions,
    stats,
    metrics,
    dailyLogs,
    metricLogs,
    loading,
    activeGoals,
    focusOfTheDay,
    toggleHabitAndUpdate,
    updateMetricAndUpdate,
  } = useAppData();

  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeekLocal(new Date()).getTime());

  const dailyMetrics = useMemo(() => {
    const todaysMetrics: Record<string, number> = {};
    metricLogs.filter(log => log.date === today).forEach(log => {
      todaysMetrics[log.metric_id] = log.value;
    });
    return todaysMetrics;
  }, [metricLogs]);




  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', primary: '#333' } as any;
    return StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: c.background },
        pageContainer: { flex: 1, paddingHorizontal: 16 },
        
        headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
        greetingContainer: {},
        headerButton: { padding: 8, backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border },
        dashboardGreeting: { fontSize: 28, fontWeight: 'bold', color: c.text },
        dashboardUsername: { fontSize: 20, fontWeight: '600', color: c.primary },
        
        cardText: { fontSize: 16, color: c.textSecondary, lineHeight: 24 },
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', marginTop: 8 },
        listItem: { borderLeftWidth: 4, borderLeftColor: c.primary, paddingLeft: 10, marginBottom: 8 },

        // Row for side-by-side cards
        cardsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: -8, // Compensate for card margin
        },
        cardItem: {
            flex: 1,
            marginHorizontal: 8,
        },

        // Estilos da Semana
        weekNav: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: c.card,
            padding: 12,
            borderRadius: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: c.border,
        },
        weekArrow: {
            padding: 8,
        },
        weekAction: {
            padding: 8,
        },
        weekTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: c.primary,
        },
        weekGrid: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 24,
        },
        dayCell: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 4,
            borderRadius: 16,
            backgroundColor: c.card,
            alignItems: 'center',
            marginHorizontal: 2,
            borderWidth: 1,
            borderColor: c.border,
            height: 90,
        },
        dayCellToday: {
            backgroundColor: c.primary,
            borderColor: c.primary,
        },
        dayLabel: {
            fontSize: 14,
            fontWeight: 'bold',
            color: c.text,
            marginBottom: 4,
            textAlign: 'center',
        },
        dayTextToday: {
            color: '#fff',
        },
        dayProgressContainer: {
            height: 5,
            width: '80%',
            backgroundColor: c.border,
            borderRadius: 2.5,
            marginTop: 'auto', // Push to the bottom
            marginBottom: 4,
        },
        dayProgressBar: {
            height: '100%',
            backgroundColor: c.accent,
            borderRadius: 2.5,
        },
    });
  }, [theme]);

  // --- Lógica da Semana ---
  const weekDays = useMemo(() => {
    const start = new Date(currentWeekStart);
    const days = generateWeekDays(start);

    // Create a lookup map for completions for efficiency
    const completionsMap = new Map<string, { completed: number, total: number }>();
    if (habits.length > 0) {
      // Initialize map for all week days
      days.forEach(day => {
        completionsMap.set(day.date, { completed: 0, total: habits.length });
      });
      // Populate with completed data
      completions.forEach(comp => {
        if (completionsMap.has(comp.date) && comp.completed) {
          const dayData = completionsMap.get(comp.date)!;
          dayData.completed += 1;
          completionsMap.set(comp.date, dayData);
        }
      });
    }

    return days.map(day => {
      const dayStats = completionsMap.get(day.date) || { completed: 0, total: habits.length };
      return {
        ...day,
        log: dailyLogs[day.date],
        completedHabits: dayStats.completed,
        totalHabits: dayStats.total,
      }
    });
  }, [currentWeekStart, dailyLogs, completions, habits]);

  const changeWeek = (direction: -1 | 1) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setCurrentWeekStart(newStart.getTime());
  };

  const handleDayClick = (date: string) => {
    router.push(`/daily-detail/${date}`);
  };

  const handleToggleHabit = (habitId: string, completed: boolean) => {
    Vibration.vibrate(50);
    toggleHabitAndUpdate(habitId, today, completed);
  };

  const handleUpdateMetric = (metricId: string, value: number) => {
    Vibration.vibrate(50);
    updateMetricAndUpdate(metricId, today, value);
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Bom Dia," : hour < 18 ? "Boa Tarde," : "Boa Noite,";
  }, []);

  const visibleMetrics = useMemo(() => metrics.filter(m => m.isVisible).slice(0, 3), [metrics]);

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="Abrindo..." theme={safeTheme} />;
  }

  return (
    <View style={styles.mainContainer}>
        <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 80 }}>
            
            <View style={styles.headerContainer}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.dashboardGreeting}>{greeting}</Text>
                    <Text style={styles.dashboardUsername}>{user?.displayName || 'Estudante'}</Text>
                </View>
                <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/quests')}>
                    <Feather name="target" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <StreakView stats={stats} />

            <BentoGrid 
                focusText={focusOfTheDay} 
                onPressFocus={() => router.push(`/daily-detail/${today}`)} 
            />

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
                <TouchableOpacity onPress={() => router.push('/weekly-view')} style={styles.weekAction}>
                    <Feather name="calendar" size={20} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => changeWeek(1)} style={styles.weekArrow}>
                    <Feather name="chevron-right" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            {/* Calendário da Semana */}
            <View style={styles.weekGrid}>
                {weekDays.map(day => {
                    const progress = day.totalHabits > 0 ? (day.completedHabits / day.totalHabits) * 100 : 0;
                    return (
                        <TouchableOpacity
                            key={day.date}
                            style={[styles.dayCell, day.isToday && styles.dayCellToday]}
                            onPress={() => handleDayClick(day.date)}
                        >
                            <Text style={[styles.dayLabel, day.isToday && styles.dayTextToday]}>{`${day.dayName} ${day.dayNumber}`}</Text>
                            <View style={styles.dayProgressContainer}>
                                <View style={[styles.dayProgressBar, { width: `${progress}%` }]}/>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <View style={styles.cardsRow}>
              <View style={styles.cardItem}>
                <Card title="Métricas" icon="zap" action={() => router.push(`/daily-detail/${today}`)} theme={theme}>
                    {visibleMetrics.length > 0 ? visibleMetrics.slice(0, 2).map(metric => (
                        <MetricInput
                            key={metric.id}
                            metricId={metric.id}
                            name={metric.name}
                            unit={metric.unit}
                            currentValue={dailyMetrics[metric.id] || 0}
                            target={(metric as any).target || 0}
                            onAdd={(val) => handleUpdateMetric(metric.id, val)}
                        />
                    )) : <Text style={styles.emptyText}>Sem métricas.</Text>}
                </Card>
              </View>
              <View style={styles.cardItem}>
                <Card title="Hábitos" icon="check-square" action={() => router.push('/(tabs)/habits')} theme={theme}>
                    <HabitTracker
                        habits={habits.slice(0, 3)}
                        completions={completions}
                        onToggle={handleToggleHabit}
                    />
                </Card>
              </View>
            </View>

            <Card title="Próximas Metas" icon="flag" action={() => router.push('/(tabs)/goals')} theme={theme}>
                {activeGoals.length > 0 ? activeGoals.map(g => (
                    <View key={g.id} style={styles.listItem}>
                        <Text style={styles.cardText}>{g.description}</Text>
                    </View>
                )) : <Text style={styles.emptyText}>Nenhuma meta ativa.</Text>}
            </Card>
        </ScrollView>
    </View>
  );
};

export default DashboardScreen;