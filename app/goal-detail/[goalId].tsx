import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import { getDB } from '../../database';
import { Goal } from '../../database/goals';
import LoadingScreen from '../../components/LoadingScreen';

const GoalDetailScreen = () => {
  const { goalId } = useLocalSearchParams();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGoalDetails = useCallback(async () => {
    if (!goalId) return;
    setLoading(true);
    const db = getDB();
    try {
      const goalResult = await db.getFirstAsync<Goal>('SELECT * FROM goals WHERE id = ?', [goalId]);
      setGoal(goalResult);
    } catch (e) {
      console.error("Erro ao carregar detalhes da meta:", e);
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    loadGoalDetails();
  }, [loadGoalDetails]);

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.background, },
        backButton: { padding: 8, marginRight: 12, marginLeft: -8 },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: c.text },
        scrollContent: { padding: 16 },
        title: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 8 },
        description: { fontSize: 16, color: c.textSecondary, marginBottom: 20, lineHeight: 24 },
        section: { marginTop: 24 },
        sectionTitle: { fontSize: 20, fontWeight: 'bold', color: c.primary, marginBottom: 12 },
    });
  }, [theme]);

  if (loading || !theme || !goal) {
    return <LoadingScreen message="Carregando detalhes..." theme={theme} />;
  }

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{goal.description}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>{goal.description}</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Período</Text>
                <Text style={styles.description}>{goal.period || 'Não definido'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status</Text>
                <Text style={styles.description}>{goal.completed ? 'Concluída' : 'Em andamento'}</Text>
            </View>
        </ScrollView>
    </View>
  );
};

export default GoalDetailScreen;