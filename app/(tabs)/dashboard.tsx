import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Vibration, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAppContext } from '../../context/AppContext';
import { useTheme } from '../../theme';
import { useGamification } from '../../hooks/useGamification';
import { useMetricSettings } from '../../hooks/useMetricSettings';
import { getDB } from '../../database';

import { BentoGrid } from '../../components/BentoGrid';
import { MetricInput } from '../../components/MetricInput';
import Card from '../../components/Card';
import LoadingScreen from '../../components/LoadingScreen';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const today = formatDate(new Date());

const DashboardScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme(); 
  const { user } = useAppContext();
  const { metrics } = useMetricSettings();
  
  const { stats, onTaskCompleted, checkStreak, refreshStats } = useGamification();
  
  const [loading, setLoading] = useState(true);
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  const [focusOfTheDay, setFocusOfTheDay] = useState<string>(''); 
  const [dailyMetrics, setDailyMetrics] = useState<Record<string, number>>({});

  // Input Rápido
  const [inputMetricId, setInputMetricId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', primary: '#333' } as any;
    return StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: c.background },
        pageContainer: { flex: 1, paddingHorizontal: 16 },
        
        gamificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
        streakBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ff5722' },
        livesBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ef4444' },
        gameText: { fontWeight: 'bold', fontSize: 16, marginLeft: 8, color: c.text },
        
        greetingContainer: { marginBottom: 20 },
        dashboardGreeting: { fontSize: 28, fontWeight: 'bold', color: c.text },
        dashboardUsername: { fontSize: 20, fontWeight: '600', color: c.primary },
        
        cardText: { fontSize: 16, color: c.textSecondary, lineHeight: 24 },
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', marginTop: 8 },
        listItem: { borderLeftWidth: 4, borderLeftColor: c.primary, paddingLeft: 10, marginBottom: 8 },
    });
  }, [theme]);

  // --- CARREGAR DADOS ---
  const loadData = useCallback(() => {
    const db = getDB();
    try {
      let logResult = db.getFirstSync('SELECT * FROM daily_logs WHERE date = ?', [today]) as { metrics: string, focus: string } | null;
      if (!logResult) {
        db.execSync(`INSERT INTO daily_logs (date, metrics, focus) VALUES ('${today}', '{}', '')`);
        logResult = { metrics: '{}', focus: '' };
      }
      setFocusOfTheDay(logResult.focus || '');
      setDailyMetrics(logResult.metrics ? JSON.parse(logResult.metrics) : {});
      
      const goalsResult = db.getAllSync('SELECT * FROM goals WHERE completed = 0 LIMIT 3');
      setActiveGoals(goalsResult);
      
      refreshStats(); 
      checkStreak();  
    } catch (e) { 
        console.error('Erro Dashboard SQLite:', e); 
    } finally { 
        setLoading(false); 
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // --- DEFINIR MÉTRICA (Substituir Valor) ---
  const handleUpdateMetric = async (metricId: string, newValue: number) => {
    // Apenas vibração leve
    Vibration.vibrate(50);

    // Lógica de SUBSTITUIÇÃO (não soma mais)
    const newMetrics = { ...dailyMetrics, [metricId]: newValue };
    setDailyMetrics(newMetrics);

    // Salva no SQLite
    try {
        const db = getDB();
        const metricsJson = JSON.stringify(newMetrics);
        await db.runAsync('UPDATE daily_logs SET metrics = ? WHERE date = ?', [metricsJson, today]);
        
        onTaskCompleted(); 
    } catch (e) { console.error("Erro ao salvar métrica:", e); }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Bom Dia," : hour < 18 ? "Boa Tarde," : "Boa Noite,";
  }, []);

  const visibleMetrics = useMemo(() => metrics.filter(m => m.isVisible).slice(0, 3), [metrics]);

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any; 
    return <LoadingScreen message="Abrindo..." theme={safeTheme} />;
  }

  return (
    <View style={styles.mainContainer}>
        <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 80 }}>
            
            <View style={styles.greetingContainer}>
                <Text style={styles.dashboardGreeting}>{greeting}</Text>
                <Text style={styles.dashboardUsername}>{user?.displayName || 'Estudante'}</Text>
            </View>

            <View style={styles.gamificationHeader}>
                <View style={styles.streakBox}>
                    <Ionicons name="flame" size={20} color="#ff5722" />
                    <Text style={styles.gameText}>{stats.current_streak} Dias</Text>
                </View>
                <View style={styles.livesBox}>
                    <Ionicons name="heart" size={20} color="#ef4444" />
                    <Text style={styles.gameText}>{stats.freeze_days} Vidas</Text>
                </View>
            </View>

            <BentoGrid 
                focusText={focusOfTheDay} 
                onPressFocus={() => router.push(`/daily-detail/${today}`)} 
            />

            <Card title="Métricas Rápidas" icon="zap" action={() => router.push(`/daily-detail/${today}`)} theme={theme}>
                {visibleMetrics.length > 0 ? visibleMetrics.map(metric => (
                    <MetricInput
                        key={metric.id}
                        metricId={metric.id}
                        name={metric.name}
                        unit={metric.unit}
                        currentValue={dailyMetrics[metric.id] || 0}
                        target={(metric as any).target || 0}
                        onAdd={(val) => handleUpdateMetric(metric.id, val)}
                    />
                )) : <Text style={styles.emptyText}>Sem métricas visíveis.</Text>}
            </Card>

            <Card title="Próximas Metas" icon="flag" action={() => router.push('/(tabs)/goals')} theme={theme}>
                {activeGoals.length > 0 ? activeGoals.map(g => (
                    <View key={g.id} style={styles.listItem}>
                        <Text style={styles.cardText}>{g.description}</Text>
                    </View>
                )) : <Text style={styles.emptyText}>Nenhuma meta ativa.</Text>}
            </Card>
        </ScrollView>
    </View>
  );
};

export default DashboardScreen;