import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Switch } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@expo/vector-icons';
import { Goal, addGoal, updateGoal } from '../app-logic/goals';

interface GoalFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  goal?: Goal | null;
  parentGoal?: Goal | null;
}

const GoalForm: React.FC<GoalFormProps> = ({ visible, onClose, onSave, goal, parentGoal }) => {
  const { theme } = useTheme();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [progressType, setProgressType] = useState<'CHECKBOX' | 'PERCENTAGE'>('CHECKBOX');
  const [target, setTarget] = useState('1');
  const [dueDate, setDueDate] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const isEditing = useMemo(() => !!goal, [goal]);

  useEffect(() => {
    if (visible) {
      setTitle(goal?.title || '');
      setDescription(goal?.description || '');
      setProgressType(goal?.progressType || 'CHECKBOX');
      setTarget(goal?.target?.toString() || '1');
      setDueDate(goal?.dueDate || '');
    }
  }, [visible, goal]);

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
        modalContent: { backgroundColor: c.card, borderRadius: 16, padding: 24, width: '90%', borderWidth: 1, borderColor: c.border },
        modalTitle: { fontSize: 22, fontWeight: 'bold', color: c.text, marginBottom: 20, textAlign: 'center' },
        input: { backgroundColor: c.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: c.text, borderWidth: 1, borderColor: c.border, marginBottom: 16 },
        label: { fontSize: 16, color: c.text, marginBottom: 8, fontWeight: '600' },
        
        switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },

        buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
        button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
        submitButton: { backgroundColor: c.primary, marginLeft: 8 },
        cancelButton: { backgroundColor: c.border, marginRight: 8 },
        buttonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
        submitButtonText: { color: c.card },
        cancelButtonText: { color: c.textSecondary },
    });
  }, [theme]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    
    const goalData: Partial<Goal> = {
      title: title.trim(),
      description: description.trim(),
      progressType,
      target: progressType === 'PERCENTAGE' ? parseInt(target) || 100 : 1,
      dueDate: dueDate || null,
    };

    try {
      if (isEditing) {
        await updateGoal(goal.id, goalData);
      } else {
        await addGoal({
            ...goalData,
            type: parentGoal ? 'SUB' : 'MAIN',
            parentId: parentGoal?.id || null,
        });
      }
      onSave();
    } catch (e) {
      console.error("Erro ao salvar meta:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isEditing ? 'Editar Meta' : (parentGoal ? 'Nova Sub-meta' : 'Nova Meta Principal')}</Text>
          
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título da meta" placeholderTextColor={theme.textSecondary} />
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Descrição (opcional)" placeholderTextColor={theme.textSecondary} multiline />
          
          <View style={styles.switchContainer}>
              <Text style={styles.label}>Acompanhar por Porcentagem?</Text>
              <Switch
                trackColor={{ false: theme.border, true: theme.primary + '80' }}
                thumbColor={progressType === 'PERCENTAGE' ? theme.primary : theme.card}
                onValueChange={(val) => setProgressType(val ? 'PERCENTAGE' : 'CHECKBOX')}
                value={progressType === 'PERCENTAGE'}
              />
          </View>

          {progressType === 'PERCENTAGE' && (
            <TextInput style={styles.input} value={target} onChangeText={setTarget} placeholder="Alvo (ex: 100)" placeholderTextColor={theme.textSecondary} keyboardType="numeric" />
          )}

          <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="Data de Vencimento (YYYY-MM-DD)" placeholderTextColor={theme.textSecondary} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose} disabled={isSaving}>
              <Feather name="x" size={18} color={theme.textSecondary} />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={theme.card} /> : (
                <>
                  <Feather name="check" size={18} color={theme.card} />
                  <Text style={[styles.buttonText, styles.submitButtonText]}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GoalForm;