
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { getGoalCountsForYear, getGoalsByPeriod, addGoal, toggleGoalCompletion, deleteGoal, Goal } from '../../database/goals';

import MonthGrid from '../../components/goals/MonthGrid';
import WeekGrid from '../../components/goals/WeekGrid';
import YearView from '../../components/goals/YearView';
import GoalListModal from '../../components/goals/GoalListModal';
import { getWeek } from 'date-fns';

const GoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [viewMode, setViewMode] = useState<'MONTHS' | 'WEEKS' | 'YEAR'>('MONTHS');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [goalCounts, setGoalCounts] = useState<Record<string, { total: number, completed: number }>>({});
  const [yearGoals, setYearGoals] = useState<Goal[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedType, setSelectedType] = useState<'YEAR' | 'MONTH' | 'WEEK'>('MONTH');
  const [modalTitle, setModalTitle] = useState('');

  const loadData = useCallback(async () => {
    const counts = await getGoalCountsForYear(currentYear.toString());
    setGoalCounts(counts);

    const yGoals = await getGoalsByPeriod(currentYear.toString());
    setYearGoals(yGoals);
  }, [currentYear]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleMonthPress = (period: string) => {
    const [, month] = period.split('-');
    const monthName = new Date(currentYear, parseInt(month) - 1).toLocaleString('pt-BR', { month: 'long' });
    
    setSelectedPeriod(period);
    setSelectedType('MONTH');
    setModalTitle(`Metas de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`);
    setModalVisible(true);
  };

  const handleWeekPress = (period: string) => {
    const weekNum = period.split('-W')[1];
    setSelectedPeriod(period);
    setSelectedType('WEEK');
    setModalTitle(`Metas da Semana ${weekNum}`);
    setModalVisible(true);
  };

  const handleYearGoalAdd = () => {
      setSelectedPeriod(currentYear.toString());
      setSelectedType('YEAR');
      setModalTitle(`Metas de ${currentYear}`);
      setModalVisible(true);
  }

  const styles = useMemo(() => {
      const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333' } as any;
      return StyleSheet.create({
          container: { flex: 1, backgroundColor: c.background },
          header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
          title: { fontSize: 28, fontWeight: 'bold', color: c.text },
          yearSelector: { flexDirection: 'row', alignItems: 'center', gap: 12 },
          yearText: { fontSize: 20, fontWeight: '600', color: c.primary },
          tabContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 20 },
          tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: c.border },
          tabActive: { backgroundColor: c.primary, borderColor: c.primary },
          tabText: { color: c.textSecondary, fontWeight: '600' },
          tabTextActive: { color: '#fff' },
          content: { paddingHorizontal: 16, paddingBottom: 100 }
      });
  }, [theme]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Metas</Text>
        <View style={styles.yearSelector}>
            <TouchableOpacity onPress={() => setCurrentYear(y => y - 1)}>
                <Feather name="chevron-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.yearText}>{currentYear}</Text>
            <TouchableOpacity onPress={() => setCurrentYear(y => y + 1)}>
                <Feather name="chevron-right" size={24} color={theme.text} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['MONTHS', 'WEEKS', 'YEAR'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, viewMode === tab && styles.tabActive]} onPress={() => setViewMode(tab)}>
                <Text style={[styles.tabText, viewMode === tab && styles.tabTextActive]}>
                    {tab === 'MONTHS' ? 'Mensal' : tab === 'WEEKS' ? 'Semanal' : 'Anual'}
                </Text>
            </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'MONTHS' && (<MonthGrid year={currentYear} onMonthPress={handleMonthPress} goalCounts={goalCounts} />)}
        {viewMode === 'WEEKS' && (<WeekGrid year={currentYear} onWeekPress={handleWeekPress} goalCounts={goalCounts} />)}
        {viewMode === 'YEAR' && (
            <YearView 
                goals={yearGoals} 
                onAddGoal={handleYearGoalAdd}
                onToggleGoal={async (id, status) => { await toggleGoalCompletion(id, !status); loadData(); }}
                onDeleteGoal={async (id) => { await deleteGoal(id); loadData(); }}
            />
        )}
      </ScrollView>

      <GoalListModal visible={modalVisible} onClose={() => setModalVisible(false)} period={selectedPeriod} type={selectedType} title={modalTitle} onUpdate={loadData} />
    </View>
  );
};

export default GoalsScreen;
