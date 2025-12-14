import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';
import { useMetricSettings } from '../../hooks/useMetricSettings';
import { getDB } from '../../database';
import { useGamification } from '../../hooks/useGamification';

import { MetricInput } from '../../components/MetricInput';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';

const DailyDetailScreen = () => {
  const { date } = useLocalSearchParams(); 
  const dateString = Array.isArray(date) ? date[0] : date;
  
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { metrics } = useMetricSettings();
  const { onTaskCompleted } = useGamification();

  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState('');
  const [dailyMetrics, setDailyMetrics] = useState<Record<string, number>>({});
  
  const [habits, setHabits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666', accent: '#0f0' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        content: { padding: 16, paddingBottom: 100 },
        
        sectionTitle: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 12, marginTop: 24 },
        
        // Foco
        focusContainer: { backgroundColor: c.card, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.border },
        focusLabel: { fontSize: 12, fontWeight: '700', color: c.primary, textTransform: 'uppercase', marginBottom: 8 },
        focusInput: { fontSize: 18, color: c.text, fontWeight: '600', minHeight: 40 },
        
        // Input de Tarefa
        taskInputContainer: { flexDirection: 'row', marginBottom: 16 },
        taskInput: { flex: 1, backgroundColor: c.card, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: c.border, color: c.text, marginRight: 8 },
        addButton: { backgroundColor: c.primary, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
        
        // Item de Lista
        taskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: c.card, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: c.border },
        taskText: { flex: 1, marginLeft: 12, fontSize: 16, color: c.text },
        taskCompleted: { textDecorationLine: 'line-through', color: c.textSecondary, opacity: 0.6 },
        
        emptyText: { color: c.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
    });
  }, [theme]);

  const loadData = useCallback(() => {
    const db = getDB();
    try {
        // 1. GERAÇÃO DE HÁBITOS (Se for um dia novo)
        // Verifica se já existem tarefas do tipo 'HABIT' para este dia
        const existingHabits = db.getFirstSync(`SELECT count(*) as count FROM tasks WHERE date = ? AND type = 'HABIT'`, [dateString]) as { count: number };
        
        if (existingHabits.count === 0) {
            // Copia templates ativos para o dia atual
            const templates = db.getAllSync(`SELECT * FROM habit_templates WHERE archived = 0`);
            templates.forEach((tpl: any) => {
                const id = Crypto.randomUUID();
                db.runSync(
                    `INSERT INTO tasks (id, title, completed, date, type) VALUES (?, ?, 0, ?, 'HABIT')`, 
                    [id, tpl.title, dateString]
                );
            });
        }

        // 2. Carregar Logs (Foco e Métricas)
        let log = db.getFirstSync('SELECT * FROM daily_logs WHERE date = ?', [dateString]) as any;
        if (!log) {
            setFocus('');
            setDailyMetrics({});
        } else {
            setFocus(log.focus || '');
            setDailyMetrics(log.metrics ? JSON.parse(log.metrics) : {});
        }

        // 3. Carregar Todas as Tarefas e Separar
        const allTasks = db.getAllSync('SELECT * FROM tasks WHERE date = ?', [dateString]);
        setHabits(allTasks.filter((t: any) => t.type === 'HABIT'));
        setTasks(allTasks.filter((t: any) => t.type !== 'HABIT'));

    } catch (e) { console.error("Erro carregar dia:", e); } 
    finally { setLoading(false); }
  }, [dateString]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- SALVAR FOCO ---
  const saveFocus = async () => {
    try {
        const db = getDB();
        await db.runAsync(`INSERT OR IGNORE INTO daily_logs (date, metrics, focus) VALUES (?, '{}', '')`, [dateString]);
        await db.runAsync('UPDATE daily_logs SET focus = ? WHERE date = ?', [focus, dateString]);
    } catch (e) { console.error(e); }
  };

  // --- ATUALIZAR MÉTRICA (Substituir Valor) ---
  const handleUpdateMetric = async (metricId: string, newValue: number) => {
    Vibration.vibrate(50); // Feedback tátil leve
    
    // Lógica de SUBSTITUIÇÃO (valor exato que o usuário digitou)
    const newMetrics = { ...dailyMetrics, [metricId]: newValue };
    setDailyMetrics(newMetrics);

    try {
        const db = getDB();
        await db.runAsync(`INSERT OR IGNORE INTO daily_logs (date, metrics, focus) VALUES (?, '{}', '')`, [dateString]);
        await db.runAsync('UPDATE daily_logs SET metrics = ? WHERE date = ?', [JSON.stringify(newMetrics), dateString]);
        
        // Gamificação: Ganha XP/Streak por interagir
        onTaskCompleted();
    } catch (e) { console.error(e); }
  };

  // --- ADICIONAR TAREFA ---
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
        const db = getDB();
        const id = Crypto.randomUUID();
        // Salva como 'TASK' (Tarefa Avulsa)
        await db.runAsync(`INSERT INTO tasks (id, title, completed, date, type) VALUES (?, ?, 0, ?, 'TASK')`, [id, newTaskTitle, dateString]);
        setNewTaskTitle('');
        Keyboard.dismiss();
        loadData();
    } catch (e) { console.error(e); }
  };

  // --- ALTERAR STATUS ---
  const toggleTask = async (task: any) => {
    try {
        const db = getDB();
        const newStatus = task.completed ? 0 : 1;
        await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [newStatus, task.id]);
        
        if (newStatus === 1) {
            Vibration.vibrate(50);
            onTaskCompleted();
        }
        loadData();
    } catch (e) { console.error(e); }
  };

  // --- DELETAR TAREFA ---
  const deleteTask = async (id: string) => {
    try {
        const db = getDB();
        await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
        loadData();
    } catch (e) { console.error(e); }
  };

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
            habits.map(habit => (
                <View key={habit.id} style={styles.taskItem}>
                    <TouchableOpacity onPress={() => toggleTask(habit)} style={{ marginRight: 12 }}>
                        <Feather name={habit.completed ? "check-square" : "square"} size={24} color={habit.completed ? theme.accent : theme.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.taskText, habit.completed && styles.taskCompleted]}>{habit.title}</Text>
                </View>
            ))
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
                    <TouchableOpacity onPress={() => toggleTask(task)} style={{ marginRight: 12 }}>
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
                    // Atualiza com o valor exato digitado
                    onAdd={(amount) => handleUpdateMetric(metric.id, amount)}
                />
            ))}
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DailyDetailScreen;