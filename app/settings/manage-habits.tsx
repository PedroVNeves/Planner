import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useAppData } from '../../context/AppDataContext';
import { addHabitTemplate, updateHabitTemplate, archiveHabitTemplate, Habit } from '../../database/habits';
import LoadingScreen from '../../components/LoadingScreen';
import HabitForm from '../../components/HabitForm';

const HabitsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { habits, loading, refreshAllData } = useAppData();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000' } as any;
    return StyleSheet.create({
      pageContainer: { flex: 1, backgroundColor: c.background },
      headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
      pageTitle: { fontSize: 28, fontWeight: 'bold', color: c.text },
      addButton: { backgroundColor: c.primary, padding: 10, borderRadius: 50 },
      habitItem: { backgroundColor: c.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border, marginBottom: 12, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      habitInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
      colorIndicator: { width: 12, height: 12, borderRadius: 6 },
      habitTitle: { fontSize: 18, fontWeight: '600', color: c.text },
      habitActions: { flexDirection: 'row' },
      actionButton: { padding: 8, marginLeft: 8 },
      emptyText: { textAlign: 'center', marginTop: 40, color: c.textSecondary, fontStyle: 'italic' },
    });
  }, [theme]);

  const handleAddHabit = async (title: string, color: string, frequency: number[]) => {
    await addHabitTemplate(title, color, frequency);
    setIsFormVisible(false);
    refreshAllData();
  };

  const handleUpdateHabit = async (title: string, color: string, frequency: number[]) => {
    if (selectedHabit) {
      await updateHabitTemplate(selectedHabit.id, title, color, frequency);
      setIsFormVisible(false);
      setSelectedHabit(null);
      refreshAllData();
    }
  };

  const handleArchiveHabit = (id: string) => {
    Alert.alert("Arquivar Hábito", "Tem certeza?", [{ text: "Cancelar", style: "cancel" }, { text: "Arquivar", style: "destructive", onPress: async () => { await archiveHabitTemplate(id); refreshAllData(); }}]);
  };

  const openForm = (habit: Habit | null = null) => {
    setSelectedHabit(habit);
    setIsFormVisible(true);
  };

  const parseFrequency = (freq: string | number[]): number[] => {
    if (Array.isArray(freq)) return freq;
    try { return JSON.parse(freq); } catch { return [0,1,2,3,4,5,6]; }
  }

  if (loading || !theme) {
    return <LoadingScreen message="Carregando hábitos..." theme={theme} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Hábitos', headerShown: false }} />
      <View style={[styles.pageContainer, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>Gerenciar Hábitos</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => openForm()}><Feather name="plus" size={24} color={theme.card} /></TouchableOpacity>
        </View>
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.habitItem}>
              <View style={styles.habitInfo}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color || theme.primary }]} />
                <Text style={styles.habitTitle}>{item.title}</Text>
              </View>
              <View style={styles.habitActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openForm(item)}><Feather name="edit" size={20} color={theme.textSecondary} /></TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleArchiveHabit(item.id)}><Feather name="archive" size={20} color={theme.textSecondary} /></TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhum hábito encontrado. Adicione um novo!</Text>}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        />
        {isFormVisible && (
          <HabitForm
            visible={isFormVisible}
            onClose={() => { setIsFormVisible(false); setSelectedHabit(null); }}
            onSubmit={selectedHabit ? handleUpdateHabit : handleAddHabit}
            initialTitle={selectedHabit?.title}
            initialColor={selectedHabit?.color}
            initialFrequency={selectedHabit ? parseFrequency(selectedHabit.frequency) : undefined}
          />
        )}
      </View>
    </>
  );
};

export default HabitsScreen;