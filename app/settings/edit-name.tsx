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
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme'; // Importação correta do tema
import { getDB } from '../../database'; // SQLite

export default function EditNameScreen() {
  const { user, setSessionUser } = useAppContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', card: '#eee', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        
        // Cabeçalho
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            marginBottom: 16,
            backgroundColor: c.background,
        },
        backButton: { padding: 8, marginRight: 12, marginLeft: -8 },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: c.text },

        content: { padding: 24 },
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
  }, [theme]);

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert("Erro", "Utilizador não encontrado.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Erro", "O nome não pode ficar em branco.");
      return;
    }

    setLoading(true);
    try {
      const db = getDB();
      
      // 1. Atualiza no Banco de Dados (SQLite)
      await db.runAsync('UPDATE users SET username = ? WHERE id = ?', [name.trim(), user.uid]);
      
      // 2. Atualiza o Estado Global (Contexto)
      // Precisamos clonar o objeto usuário e mudar o nome para refletir na UI imediatamente
      if (setSessionUser) {
          setSessionUser({ ...user, displayName: name.trim() });
      }

      Alert.alert("Sucesso", "Nome atualizado!");
      router.back(); 

    } catch (error: any) {
      console.error("Erro ao atualizar nome:", error);
      Alert.alert("Erro", "Não foi possível atualizar no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Cabeçalho Customizado */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alterar Nome</Text>
      </View>

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