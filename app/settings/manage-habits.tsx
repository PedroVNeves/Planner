import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Keyboard 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importante para a margem

import { useTheme } from '../../theme';
import { getDB } from '../../database';
import LoadingScreen from '../../components/LoadingScreen';

export default function ManageHabitsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // Medidas da área segura
  
  const [habits, setHabits] = useState<any[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [loading, setLoading] = useState(true);

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', card: '#eee', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        
        // Cabeçalho Personalizado
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 16,
            // paddingTop será dinâmico via insets
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            marginBottom: 16,
            backgroundColor: c.background,
        },
        backButton: {
            padding: 8,
            marginRight: 12,
            marginLeft: -8, // Ajuste visual para alinhar à esquerda
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: c.text,
        },

        // Conteúdo
        contentContainer: {
            paddingHorizontal: 16,
        },
        
        // Input
        inputContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
        input: { flex: 1, backgroundColor: c.card, padding: 14, borderRadius: 12, color: c.text, borderWidth: 1, borderColor: c.border, marginRight: 10, fontSize: 16 },
        addButton: { backgroundColor: c.primary, padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
        
        // Lista
        listContent: { paddingBottom: 40 },
        item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.card, padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: c.border },
        itemText: { color: c.text, fontSize: 16, fontWeight: '500' },
        deleteButton: { padding: 8 },
        
        emptyText: { color: c.textSecondary, textAlign: 'center', marginTop: 20, fontSize: 14, fontStyle: 'italic' }
    });
  }, [theme]);

  const loadHabits = useCallback(() => {
    const db = getDB();
    try {
        const result = db.getAllSync('SELECT * FROM habit_templates WHERE archived = 0 ORDER BY createdAt DESC');
        setHabits(result);
    } catch (e) { 
        console.error("Erro ao carregar hábitos:", e); 
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { loadHabits(); }, [loadHabits]);

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const db = getDB();
    try {
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();
        
        db.runSync(
            `INSERT INTO habit_templates (id, title, archived, createdAt) VALUES (?, ?, 0, ?)`, 
            [id, newHabit.trim(), now]
        );
        
        setNewHabit('');
        Keyboard.dismiss();
        loadHabits();
    } catch (e) { console.error("Erro ao adicionar:", e); }
  };

  const archiveHabit = (id: string) => {
    const db = getDB();
    try {
        db.runSync(`UPDATE habit_templates SET archived = 1 WHERE id = ?`, [id]);
        loadHabits();
    } catch (e) { console.error("Erro ao arquivar:", e); }
  };

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="Carregando hábitos..." theme={safeTheme} />;
  }

  return (
    <View style={styles.container}>
      {/* Oculta o header padrão para usarmos o nosso com margem correta */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Cabeçalho com Margem Segura */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerir Hábitos</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.inputContainer}>
            <TextInput 
                style={styles.input} 
                placeholder="Novo hábito (ex: Ler 10 min)" 
                placeholderTextColor={theme.textSecondary}
                value={newHabit}
                onChangeText={setNewHabit}
                onSubmitEditing={addHabit}
            />
            <TouchableOpacity style={styles.addButton} onPress={addHabit}>
                <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum hábito configurado. Adicione um acima!</Text>}
            renderItem={({ item }) => (
                <View style={styles.item}>
                    <Text style={styles.itemText}>{item.title}</Text>
                    <TouchableOpacity onPress={() => archiveHabit(item.id)} style={styles.deleteButton}>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            )}
        />
      </View>
    </View>
  );
}