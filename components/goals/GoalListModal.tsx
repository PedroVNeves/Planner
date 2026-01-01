import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Goal, getGoalsByPeriod, addGoal, toggleGoalCompletion, deleteGoal, GoalType } from '../../database/goals';

interface GoalListModalProps {
  visible: boolean;
  onClose: () => void;
  period: string;
  type: GoalType;
  title: string;
  onUpdate: () => void;
}

const GoalListModal: React.FC<GoalListModalProps> = ({ visible, onClose, period, type, title, onUpdate }) => {
  const { theme } = useTheme();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && period) {
      loadGoals();
    }
  }, [visible, period]);

  const loadGoals = async () => {
    setLoading(true);
    const data = await getGoalsByPeriod(period);
    setGoals(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newGoalText.trim()) return;
    await addGoal(newGoalText.trim(), type, period);
    setNewGoalText('');
    loadGoals();
    onUpdate();
  };

  const handleToggle = async (id: string, currentStatus: number) => {
    await toggleGoalCompletion(id, currentStatus === 0);
    loadGoals();
    onUpdate();
  };

  const handleDelete = (id: string) => {
      Alert.alert('Excluir Meta', 'Tem certeza?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: async () => {
              await deleteGoal(id);
              loadGoals();
              onUpdate();
          }}
      ])
  };

  const styles = useMemo(() => StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '70%', },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.text, },
    inputContainer: { flexDirection: 'row', marginBottom: 20, gap: 12, },
    input: { flex: 1, backgroundColor: theme.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: theme.text, borderWidth: 1, borderColor: theme.border, },
    addButton: { backgroundColor: theme.primary, width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', },
    listContent: { paddingBottom: 40, },
    goalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border, },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12, },
    checkboxCompleted: { backgroundColor: theme.primary, },
    goalText: { fontSize: 16, color: theme.text, flex: 1, },
    goalTextCompleted: { textDecorationLine: 'line-through', color: theme.textSecondary, },
    deleteBtn: { padding: 8 },
    emptyText: { textAlign: 'center', color: theme.textSecondary, fontStyle: 'italic', marginTop: 40 }
  }), [theme]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput style={styles.input} placeholder="Adicionar nova meta..." placeholderTextColor={theme.textSecondary} value={newGoalText} onChangeText={setNewGoalText} onSubmitEditing={handleAdd} />
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}><Feather name="plus" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <FlatList
            data={goals}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.goalItem}>
                <TouchableOpacity style={[styles.checkbox, item.completed === 1 && styles.checkboxCompleted]} onPress={() => handleToggle(item.id, item.completed)}>
                  {item.completed === 1 && <Feather name="check" size={16} color={theme.card} />}
                </TouchableOpacity>
                <Text style={[styles.goalText, item.completed === 1 && styles.goalTextCompleted]}>{item.description}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}><Feather name="trash-2" size={18} color={theme.textSecondary} /></TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma meta definida para este período.</Text>}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GoalListModal;