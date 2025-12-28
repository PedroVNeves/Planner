import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Vibration,
  Keyboard 
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';

import { useTheme } from '../../theme';
import { useMetricSettings } from '../../hooks/useMetricSettings';
import { useAppData } from '../../context/AppDataContext';
import { getDB } from '../../database';

import { MetricInput } from '../../components/MetricInput';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';

const DailyDetailScreen = () => {
  const { date } = useLocalSearchParams(); 
  const dateString = Array.isArray(date) ? date[0] : date;
  
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { metrics } = useMetricSettings();

  // Use Global State
  const { 
    metricLogs, 
    habits, 
    completions, 
    loading, 
    updateMetricAndUpdate, 
    toggleHabitAndUpdate 
  } = useAppData();

  const [focus, setFocus] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Get metrics for the specific day from global state
  const dailyMetrics = useMemo(() => {
    const todaysMetrics: Record<string, number> = {};
    metricLogs.filter(log => log.date === dateString).forEach(log => {
      todaysMetrics[log.metric_id] = log.value;
    });
    return todaysMetrics;
  }, [metricLogs, dateString]);

  // Load focus and non-habit tasks from DB for this specific day
  const loadScreenData = useCallback(async () => {
    const db = getDB();
    try {
      // Load Focus
      const log = await db.getFirstAsync('SELECT focus FROM daily_logs WHERE date = ?', [dateString]) as any;
      if (log) {
        setFocus(log.focus || '');
      }
      // Load one-off tasks
      const allTasks = await db.getAllAsync("SELECT * FROM tasks WHERE date = ? AND type = 'TASK'", [dateString]);
      setTasks(allTasks);
    } catch(e) {
      console.error("Error loading daily detail screen data:", e);
    }
  }, [dateString]);

  useEffect(() => {
    loadScreenData();
  }, [loadScreenData]);


  // --- SALVAR FOCO ---
  const saveFocus = async () => {
    try {
        const db = getDB();
        await db.runAsync(`INSERT INTO daily_logs (date, focus) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET focus = excluded.focus`, [dateString, focus]);
    } catch (e) { console.error(e); }
  };

  // --- ADICIONAR TAREFA ---
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
        const db = getDB();
        const id = Crypto.randomUUID();
        await db.runAsync(`INSERT INTO tasks (id, title, completed, date, type) VALUES (?, ?, 0, ?, 'TASK')`, [id, newTaskTitle, dateString]);
        setNewTaskTitle('');
        Keyboard.dismiss();
        await loadScreenData(); // Reload only screen-specific data
    } catch (e) { console.error(e); }
  };

  // --- ALTERAR STATUS DA TAREFA AVULSA ---
  const toggleOneOffTask = async (task: any) => {
    try {
        const db = getDB();
        const newStatus = task.completed ? 0 : 1;
        await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [newStatus, task.id]);
        
        if (newStatus === 1) {
            Vibration.vibrate(50);
        }
        await loadScreenData();
    } catch (e) { console.error(e); }
  };

  // --- DELETAR TAREFA ---
  const deleteTask = async (id: string) => {
    try {
        const db = getDB();
        await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
        await loadScreenData();
    } catch (e) { console.error(e); }
  };
  
  // Get completions for this specific day
  const dailyCompletions = useMemo(() => {
    const map = new Map<string, boolean>();
    completions.filter(c => c.date === dateString).forEach(c => {
      map.set(c.habit_id, c.completed === 1);
    });
    return map;
  }, [completions, dateString]);


  // 🛡️ Estilos Blindados (código omitido por brevidade, sem alterações)
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666', accent: '#0f0' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        content: { padding: 16, paddingBottom: 100 },
        sectionTitle: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 12, marginTop: 24 },
        focusContainer: { backgroundColor: c.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border },
        focusLabel: { fontSize: 12, fontWeight: '700', color: c.primary, textTransform: 'uppercase', marginBottom: 8 },
        focusInput: { fontSize: 18, color: c.text, fontWeight: '600', minHeight: 40 },
        taskInputContainer: { flexDirection: 'row', marginBottom: 16 },
        taskInput: { flex: 1, backgroundColor: c.card, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: c.border, color: c.text, marginRight: 8 },
        addButton: { backgroundColor: c.primary, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
        taskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: c.card, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: c.border },
        taskText: { flex: 1, marginLeft: 12, fontSize: 16, color: c.text },
        taskCompleted: { textDecorationLine: 'line-through', color: c.textSecondary, opacity: 0.6 },
        emptyText: { color: c.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    });
  }, [theme]);

  if (loading || !theme) return <LoadingScreen message="Carregando dia..." theme={theme || {background: '#fff'} as any} />;

  const formattedDate = dateString?.split('-').reverse().join('/');

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Stack.Screen 
        options={{ 
            title: `Dia ${formattedDate}`, 
            headerBackTitle: 'Voltar', 
            headerTintColor: theme.text, 
            headerStyle: { backgroundColor: theme.background }, 
            headerShadowVisible: false 
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Foco */}
        <View style={styles.focusContainer}>
            <Text style={styles.focusLabel}>🎯 Foco Principal</Text>
            <TextInput 
                style={styles.focusInput} 
                placeholder="Objetivo de hoje?" 
                placeholderTextColor={theme.textSecondary} 
                value={focus} 
                onChangeText={setFocus} 
                onBlur={saveFocus} 
                multiline 
            />
        </View>

        {/* Hábitos Diários (Automáticos) */}
        <Text style={styles.sectionTitle}>Hábitos Diários</Text>
        {habits.length > 0 ? (
            habits.map(habit => {
              const isCompleted = dailyCompletions.get(habit.id) || false;
              return (
                <View key={habit.id} style={styles.taskItem}>
                    <TouchableOpacity onPress={() => toggleHabitAndUpdate(habit.id, dateString, !isCompleted)} style={{ marginRight: 12 }}>
                        <Feather name={isCompleted ? "check-square" : "square"} size={24} color={isCompleted ? theme.accent : theme.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.taskText, isCompleted && styles.taskCompleted]}>{habit.title}</Text>
                </View>
              )
            })
        ) : (
            <Text style={styles.emptyText}>Configure seus hábitos no Perfil.</Text>
        )}

        {/* Tarefas Avulsas */}
        <Text style={styles.sectionTitle}>Tarefas Avulsas</Text>
        <View style={styles.taskInputContainer}>
            <TextInput 
                style={styles.taskInput} 
                placeholder="Nova tarefa..." 
                placeholderTextColor={theme.textSecondary} 
                value={newTaskTitle} 
                onChangeText={setNewTaskTitle} 
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        {tasks.length > 0 ? (
            tasks.map(task => (
                <View key={task.id} style={styles.taskItem}>
                    <TouchableOpacity onPress={() => toggleOneOffTask(task)} style={{ marginRight: 12 }}>
                        <Feather name={task.completed ? "check-square" : "square"} size={24} color={task.completed ? theme.accent : theme.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>{task.title}</Text>
                    <TouchableOpacity onPress={() => deleteTask(task.id)} style={{ padding: 4 }}>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            ))
        ) : (
            <Text style={styles.emptyText}>Nenhuma tarefa extra hoje.</Text>
        )}

        {/* Métricas */}
        <Text style={styles.sectionTitle}>Métricas</Text>
        <Card title="Registros" icon="bar-chart-2" action={() => {}} theme={theme}>
            {metrics.map(metric => (
                <MetricInput
                    key={metric.id}
                    metricId={metric.id}
                    name={metric.name}
                    unit={metric.unit}
                    currentValue={dailyMetrics[metric.id] || 0}
                    target={(metric as any).target || 0}
                    // Chama a função correta do contexto
                    onAdd={(amount) => updateMetricAndUpdate(metric.id, dateString, amount)}
                />
            ))}
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DailyDetailScreen;