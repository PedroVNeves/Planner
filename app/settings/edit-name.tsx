
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUser } from '../../context/UserContext';
import { useTheme } from '../../theme';

export default function EditNameScreen() {
  const { user, updateUser, refreshUser } = useUser(); // Use the new updateUser function
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', card: '#eee', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        content: { padding: 24, paddingTop: insets.top + 24 },
        subtitle: { fontSize: 16, color: c.textSecondary, lineHeight: 24, marginBottom: 24 },
        input: { 
            backgroundColor: c.card, 
            color: c.text, 
            borderColor: c.border, 
            borderWidth: 1, 
            borderRadius: 12, 
            paddingHorizontal: 16, 
            paddingVertical: 14, 
            fontSize: 18, 
            marginBottom: 32 
        },
        saveButton: { backgroundColor: c.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
        buttonDisabled: { opacity: 0.6 },
        saveButtonText: { color: c.card, fontSize: 16, fontWeight: 'bold' },
    });
  }, [theme, insets]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode ficar em branco.");
      return;
    }

    setLoading(true);
    try {
      await updateUser({ displayName: name.trim() });
      Alert.alert("Sucesso", "Nome atualizado!");
      refreshUser(); // Refresh user data globally
      router.back(); 

    } catch (error: any) {
      console.error("Erro ao atualizar nome:", error);
      Alert.alert("Erro", "Não foi possível atualizar o nome.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
            <Text style={styles.subtitle}>
                Como gostaria de ser chamado no seu Dashboard?
            </Text>

            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="O seu nome"
                autoCapitalize="words"
                editable={!loading}
                placeholderTextColor={theme.textSecondary}
                autoFocus
            />

            <TouchableOpacity 
                style={[styles.saveButton, loading && styles.buttonDisabled]} 
                onPress={handleSave} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={theme.card} />
                ) : (
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
