import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as Crypto from 'expo-crypto';

// --- IMPORTAÇÕES ---
import { useTheme } from '../../theme'; 
import { getDB } from '../../database'; 
import LoadingScreen from '../../components/LoadingScreen'; 

type GoalType = 'YEAR' | 'MONTH' | 'WEEK';
const goalTypes: Record<GoalType, string> = { YEAR: 'Ano', MONTH: 'Mês', WEEK: 'Semana' };

const GoalsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Estados Locais
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  
  // Estados do Formulário
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<GoalType>('MONTH');

  // =================================================================
  // 🛡️ ESTILOS BLINDADOS
  // =================================================================
  const styles = useMemo(() => {
    const c = theme || { 
        background: '#FFFFFF', 
        card: '#F5F5F5', 
        text: '#000000', 
        textSecondary: '#666666', 
        primary: '#6200EE', 
        accent: '#03DAC6',
        border: '#E0E0E0'
    } as any;

    return StyleSheet.create({
        pageContainer: { flex: 1, padding: 16, backgroundColor: c.background },
        pageTitle: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 20 },
        
        // Formulário
        formContainer: { backgroundColor: c.card, padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: c.border },
        formTitle: { fontSize: 20, fontWeight: '600', color: c.primary, marginBottom: 12 },
        
        // Inputs e Botões
        input: { backgroundColor: c.background, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 12 },
        button: { backgroundColor: c.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
        buttonDisabled: { backgroundColor: c.primary, opacity: 0.6 },
        buttonText: { color: c.card, fontSize: 16, fontWeight: '600' },
        
        // Seletor de Tipo
        typeSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
        typeButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.primary, alignItems: 'center', marginHorizontal: 4 },
        typeButtonSelected: { backgroundColor: c.primary },
        typeButtonText: { color: c.primary, fontWeight: '600' },
        typeButtonTextSelected: { color: c.card, fontWeight: '600' },
        
        // Listas
        goalSection: { marginBottom: 20 },
        goalSectionTitle: { fontSize: 22, fontWeight: 'bold', color: c.primary, borderBottomColor: c.border, borderBottomWidth: 2, paddingBottom: 4, marginBottom: 12 },
        taskItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: c.card, borderRadius: 8, borderWidth: 1, borderColor: c.border, marginBottom: 8 },
        taskItemCompleted: { backgroundColor: c.accent ? c.accent + '15' : '#e6fffa' },
        taskText: { flex: 1, marginLeft: 12, fontSize: 16, color: c.text },
        taskTextCompleted: { textDecorationLine: 'line-through', color: c.textSecondary },
        
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', marginTop: 8 },
    });
  }, [theme]);

  // --- LER METAS ---
  const loadGoals = useCallback(() => {
    try {
        const db = getDB();
        const result = db.getAllSync('SELECT * FROM goals ORDER BY createdAt DESC');
        setGoals(result);
    } catch (e) { 
        console.error("Erro ao carregar metas:", e); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useFocusEffect(useCallback(() => { loadGoals(); }, [loadGoals]));

  // --- ADICIONAR META ---
  const handleAddGoal = () => {
    if (!newDescription.trim()) return;
    
    setWriting(true);
    try {
      const db = getDB();
      const id = Crypto.randomUUID();
      const now = new Date().toISOString();
      
      // Uso de runSync para garantir gravação imediata
      db.runSync(
        'INSERT INTO goals (id, description, type, completed, createdAt) VALUES (?, ?, ?, ?, ?)', 
        [id, newDescription.trim(), newType, 0, now]
      );
      
      setNewDescription('');
      Keyboard.dismiss();
      loadGoals();
      
    } catch (e) { 
        console.error("Erro ao adicionar meta:", e); 
    } finally { 
        setWriting(false); 
    }
  };

  // --- ALTERAR STATUS ---
  const handleToggleGoal = (goal: any) => {
    try {
        const db = getDB();
        const newStatus = goal.completed ? 0 : 1;
        db.runSync('UPDATE goals SET completed = ? WHERE id = ?', [newStatus, goal.id]);
        loadGoals();
    } catch (e) { console.error("Erro ao atualizar meta:", e); }
  };
  
  // --- DELETAR META ---
  const handleDeleteGoal = (goalId: string) => {
    try {
        const db = getDB();
        db.runSync('DELETE FROM goals WHERE id = ?', [goalId]);
        loadGoals();
    } catch (e) { console.error("Erro ao deletar meta:", e); }
  };

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="A carregar metas..." theme={safeTheme} />;
  }

  return (
    <ScrollView 
      style={styles.pageContainer} 
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Minhas Metas</Text>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Nova Meta</Text>
        
        <View style={styles.typeSelector}>
          {(Object.keys(goalTypes) as GoalType[]).map((key) => (
            <TouchableOpacity 
              key={key} 
              style={[styles.typeButton, newType === key && styles.typeButtonSelected]} 
              onPress={() => setNewType(key)}
            >
              <Text style={newType === key ? styles.typeButtonTextSelected : styles.typeButtonText}>
                {goalTypes[key]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TextInput 
          style={styles.input} 
          value={newDescription} 
          onChangeText={setNewDescription} 
          placeholder="Descreva sua meta..." 
          editable={!writing} 
          placeholderTextColor={theme.textSecondary} 
        />
        
        <TouchableOpacity 
          style={[styles.button, writing ? styles.buttonDisabled : {}]} 
          onPress={handleAddGoal} 
          disabled={writing}
        >
          {writing ? (
            <ActivityIndicator color={theme.card} />
          ) : (
            <Text style={styles.buttonText}>Adicionar Meta</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Listas por Tipo */}
      {(Object.keys(goalTypes) as GoalType[]).map(typeKey => {
        const filteredGoals = goals.filter(g => g.type === typeKey);
        
        return (
          <View key={typeKey} style={styles.goalSection}>
            <Text style={styles.goalSectionTitle}>{goalTypes[typeKey]} ({filteredGoals.length})</Text>
            
            {filteredGoals.length > 0 ? (
              filteredGoals.map(goal => (
                <View key={goal.id} style={[styles.taskItem, !!goal.completed && styles.taskItemCompleted]}>
                  <TouchableOpacity onPress={() => handleToggleGoal(goal)} disabled={writing}>
                    <Feather 
                      name={!!goal.completed ? "check-circle" : "circle"} 
                      size={24} 
                      color={!!goal.completed ? theme.accent : theme.textSecondary} 
                    />
                  </TouchableOpacity>
                  
                  <Text style={[styles.taskText, !!goal.completed && styles.taskTextCompleted]}>
                    {goal.description}
                  </Text>
                  
                  <TouchableOpacity onPress={() => handleDeleteGoal(goal.id)} disabled={writing}>
                    <Feather name="trash-2" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Nenhuma meta de {goalTypes[typeKey]}.</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default GoalsScreen;