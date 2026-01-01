import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@expo/vector-icons';

interface HabitFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, color: string, frequency: number[]) => void;
  initialTitle?: string;
  initialColor?: string;
  initialFrequency?: number[];
}

const COLORS = ['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#6366F1', '#14B8A6'];
const DAYS = [{ label: 'D', value: 0 }, { label: 'S', value: 1 }, { label: 'T', value: 2 }, { label: 'Q', value: 3 }, { label: 'Q', value: 4 }, { label: 'S', value: 5 }, { label: 'S', value: 6 }];

const HabitForm: React.FC<HabitFormProps> = ({ visible, onClose, onSubmit, initialTitle = '', initialColor = COLORS[0], initialFrequency = [0,1,2,3,4,5,6] }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);
  const [frequency, setFrequency] = useState<number[]>(initialFrequency);

  useEffect(() => {
    if(visible) {
      setTitle(initialTitle);
      setColor(initialColor || COLORS[0]);
      setFrequency(initialFrequency || [0,1,2,3,4,5,6]);
    }
  }, [visible, initialTitle]);

  const toggleDay = (dayIndex: number) => {
    setFrequency(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort());
  };

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000' } as any;
    return StyleSheet.create({
      modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
      modalContent: { backgroundColor: c.card, borderRadius: 24, padding: 24, width: '90%', maxHeight: '90%', borderWidth: 1, borderColor: c.border },
      modalTitle: { fontSize: 22, fontWeight: 'bold', color: c.text, marginBottom: 20, textAlign: 'center' },
      label: { fontSize: 14, fontWeight: '600', color: c.textSecondary, marginBottom: 8, marginTop: 16 },
      input: { backgroundColor: c.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: c.text, borderWidth: 1, borderColor: c.border },
      colorsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
      colorOption: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
      colorSelected: { borderWidth: 2, borderColor: c.text },
      daysContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
      dayButton: { flex: 1, aspectRatio: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background, borderWidth: 1, borderColor: c.border },
      dayButtonSelected: { backgroundColor: c.primary, borderColor: c.primary },
      dayText: { fontSize: 14, fontWeight: '600', color: c.textSecondary },
      dayTextSelected: { color: '#fff' },
      buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
      button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
      submitButton: { backgroundColor: c.primary, marginLeft: 8 },
      cancelButton: { backgroundColor: c.border, marginRight: 8 },
      buttonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
      submitButtonText: { color: '#fff' },
      cancelButtonText: { color: c.textSecondary },
    });
  }, [theme]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim(), color, frequency);
      onClose();
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>{initialTitle ? 'Editar Hábito' : 'Novo Hábito'}</Text>
                <Text style={styles.label}>NOME</Text>
                <TextInput style={styles.input} placeholder="Ex: Ler 10 páginas" value={title} onChangeText={setTitle} placeholderTextColor={theme.textSecondary} autoFocus={!initialTitle} />
                <Text style={styles.label}>COR</Text>
                <View style={styles.colorsContainer}>
                    {COLORS.map((c) => (
                    <TouchableOpacity key={c} style={[styles.colorOption, { backgroundColor: c }, color === c && styles.colorSelected]} onPress={() => setColor(c)}>
                        {color === c && <Feather name="check" size={16} color="#fff" />}
                    </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.label}>FREQUÊNCIA</Text>
                <View style={styles.daysContainer}>
                    {DAYS.map((day) => {
                        const isSelected = frequency.includes(day.value);
                        return (
                            <TouchableOpacity key={day.value} style={[styles.dayButton, isSelected && styles.dayButtonSelected]} onPress={() => toggleDay(day.value)}>
                                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Feather name="x" size={18} color={theme.textSecondary} /><Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}><Feather name="check" size={18} color="#fff" /><Text style={[styles.buttonText, styles.submitButtonText]}>Salvar</Text></TouchableOpacity>
                </View>
            </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default HabitForm;