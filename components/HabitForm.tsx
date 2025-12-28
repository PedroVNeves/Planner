
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@expo/vector-icons';

interface HabitFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  initialTitle?: string;
}

const HabitForm: React.FC<HabitFormProps> = ({ visible, onClose, onSubmit, initialTitle = '' }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialTitle);

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 24,
        width: '90%',
        borderWidth: 1,
        borderColor: c.border,
      },
      modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: c.text,
        marginBottom: 20,
        textAlign: 'center',
      },
      input: {
        backgroundColor: c.background,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: c.text,
        borderWidth: 1,
        borderColor: c.border,
        marginBottom: 24,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      },
      submitButton: {
        backgroundColor: c.primary,
        marginLeft: 8,
      },
      cancelButton: {
        backgroundColor: c.border,
        marginRight: 8,
      },
      buttonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
      },
      submitButtonText: {
        color: c.card,
      },
      cancelButtonText: {
        color: c.textSecondary,
      },
    });
  }, [theme]);

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit(title.trim());
      setTitle('');
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
          <Text style={styles.modalTitle}>{initialTitle ? 'Editar Hábito' : 'Novo Hábito'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Ler 10 páginas"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={theme.textSecondary}
            autoFocus
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Feather name="x" size={18} color={theme.textSecondary} />
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Feather name="check" size={18} color={theme.card} />
              <Text style={[styles.buttonText, styles.submitButtonText]}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default HabitForm;
