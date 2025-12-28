import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Removido: import { signOut } from 'firebase/auth'; 

import { useUser } from '../../context/UserContext';
import { useTheme } from '../../theme';
import { useMetricSettings } from '../../hooks/useMetricSettings'; 
import { getDB } from '../../database';
import LoadingScreen from '../../components/LoadingScreen';

// --- COMPONENTES INTERNOS ---
const StatCard: React.FC<{ label: string; value: string | number; unit: string; colors: any }> = ({ label, value, unit, colors }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 16, borderRadius: 12, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
    <Text style={{ fontSize: 16, color: colors.textSecondary, fontWeight: '500' }}>{label}</Text>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>
      {value} <Text style={{ fontSize: 14, color: colors.primary }}>{unit}</Text>
    </Text>
  </View>
);

const SettingsButton: React.FC<{ icon: any; label: string; onPress: () => void; colors: any }> = ({ icon, label, onPress, colors }) => (
  <TouchableOpacity 
    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }} 
    onPress={onPress}
  >
    <Feather name={icon} size={20} color={colors.primary} />
    <Text style={{ flex: 1, marginLeft: 12, fontSize: 16, color: colors.text }}>{label}</Text>
    <Feather name="chevron-right" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useUser(); 
  const { theme } = useTheme(); 
  const { metrics } = useMetricSettings();
  
  const [stats, setStats] = useState<any>({ totalDays: 0, totalTasksDone: 0, avgs: [] });
  const [loading, setLoading] = useState(true);

  // 🛡️ ESTILOS BLINDADOS
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        pageContainer: { flex: 1, padding: 16, backgroundColor: c.background },
        pageTitle: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 20 },
        
        profileCard: { backgroundColor: c.primary, padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 20, shadowColor: c.primary, shadowOpacity: 0.3, elevation: 10 },
        profileTitle: { fontSize: 22, fontWeight: 'bold', color: c.card, marginTop: 12 },
        profileEmail: { fontSize: 14, color: c.card, opacity: 0.8, marginTop: 2 },
        
        settingsSection: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border },
        sectionTitle: { fontSize: 20, fontWeight: 'bold', color: c.text, marginBottom: 16 },
        
        signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 10 },
        signOutButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
        
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', textAlign: 'center', padding: 10 },
    });
  }, [theme]);

  // --- LÓGICA DE CÁLCULO SQLITE ---
  const calculateStats = useCallback(async () => {
    try {
        const db = getDB();
        
        const logs = await db.getAllAsync('SELECT * FROM daily_logs');
        const totalDays = logs.length;
        
        const tasksResult = await db.getFirstAsync('SELECT count(*) as count FROM tasks WHERE completed = 1') as { count: number } | null;
        
        const metricTotals: Record<string, number> = {};
        logs.forEach((log: any) => {
            const m = log.metrics ? JSON.parse(log.metrics) : {};
            for (const key in m) {
                metricTotals[key] = (metricTotals[key] || 0) + m[key];
            }
        });

        const avgs = metrics.map(m => ({
            id: m.id,
            label: m.name,
            unit: m.unit,
            value: totalDays > 0 ? (metricTotals[m.id] || 0) / totalDays : 0
        }));

        setStats({
            totalDays,
            totalTasksDone: tasksResult?.count || 0,
            avgs
        });

    } catch (e) { 
        console.error("Erro Stats Profile:", e); 
    } finally { 
        setLoading(false); 
    }
  }, [metrics]);

  useFocusEffect(useCallback(() => { calculateStats(); }, [calculateStats]));

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="Carregando perfil..." theme={safeTheme} />;
  }

  return (
    <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
      <Text style={styles.pageTitle}>Meu Perfil</Text>

      <View style={styles.profileCard}>
        <Feather name="user" size={50} color={theme.card} />
        <Text style={styles.profileTitle}>{user?.displayName || "Estudante"}</Text>
        <Text style={styles.profileEmail}>{user?.email || "Local User"}</Text>
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Conta e Personalização</Text>
        <SettingsButton icon="edit-3" label="Alterar Nome" onPress={() => router.push('/settings/edit-name')} colors={theme} />
        <SettingsButton icon="award" label="Ver Missões" onPress={() => router.push('/quests')} colors={theme} />
        <SettingsButton icon="edit" label="Personalizar Tema" onPress={() => router.push('/settings/customize-theme')} colors={theme} />
      </View>
      
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Minhas Médias Diárias</Text>
        {stats.avgs.length > 0 ? (
            stats.avgs.map((avg: any) => (
                <StatCard key={avg.id} label={avg.label} value={avg.value.toFixed(1)} unit={avg.unit} colors={theme} />
            ))
        ) : <Text style={styles.emptyText}>Nenhuma média disponível.</Text>}
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Resumo Geral</Text>
        <StatCard label="Dias Registados" value={stats.totalDays} unit="dias" colors={theme} />
        <StatCard label="Tarefas Concluídas" value={stats.totalTasksDone} unit="tarefas" colors={theme} />
      </View>


    </ScrollView>
  );
};

export default ProfileScreen;