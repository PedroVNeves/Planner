import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';

import { useTheme } from '../../theme';
import { useAppData } from '../../context/AppDataContext';
import LoadingScreen from '../../components/LoadingScreen';
import HabitHeatmap from '../../components/HabitHeatmap';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const screenWidth = Dimensions.get('window').width;

// Função auxiliar para converter HEX para RGB (para o gráfico)
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Componente Interno de Card
const StatCard: React.FC<{ label: string; value: string | number; unit: string; colors: any }> = ({ label, value, unit, colors }) => (
  <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12, width: '48%', marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
      {value} <Text style={{ fontSize: 14, color: colors.primary }}>{unit}</Text>
    </Text>
  </View>
);

const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { habits, completions, metrics, dailyLogs, metricLogs, loading } = useAppData();

  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        pageContainer: { flex: 1, paddingHorizontal: 16, backgroundColor: c.background },
        pageTitle: { fontSize: 28, fontWeight: 'bold', color: c.text, marginBottom: 20 },
        sectionTitle: { fontSize: 20, fontWeight: 'bold', color: c.text, marginBottom: 12, marginTop: 16 },

        metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

        metricScroller: { flexDirection: 'row', marginBottom: 10 },
        metricButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderColor: c.border, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
        metricButtonSelected: { backgroundColor: c.primary, borderColor: c.primary },
        metricButtonText: { color: c.primary, fontWeight: '600', marginLeft: 8 },
        metricButtonTextSelected: { color: c.card },

        typeSelector: { flexDirection: 'row', width: '100%' },
        typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: c.card, borderColor: c.border, borderWidth: 1, padding: 12 },
        typeButtonSelected: { backgroundColor: c.primary, borderColor: c.primary },
        typeButtonText: { color: c.primary, fontWeight: '600', marginLeft: 8 },
        typeButtonTextSelected: { color: c.card },

        chartCard: { backgroundColor: c.card, borderRadius: 16, paddingVertical: 20, paddingHorizontal: 16, marginTop: 20, alignItems: 'center', borderWidth: 1, borderColor: c.border },
        cardTitle: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 16 },
        chartStyle: { borderRadius: 16 },
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', textAlign: 'center', padding: 20 },
    });
  }, [theme]);

  // Seleciona a primeira métrica automaticamente
  useEffect(() => {
    if (metrics.length > 0 && !selectedMetricId) {
      const firstVisible = metrics.find(m => m.isVisible) || metrics[0];
      setSelectedMetricId(firstVisible.id);
    }
  }, [metrics, selectedMetricId]);
  
  const habitCompletionsMap = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const habit of habits) {
      map[habit.id] = completions.filter(c => c.habit_id === habit.id);
    }
    return map;
  }, [habits, completions]);



  // --- CÁLCULOS ---
  const { chartData, selectedMetric, totalStats } = useMemo(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const metric = metrics.find(m => m.id === selectedMetricId);

    const allLogs = Object.values(dailyLogs);
    const totalDays = allLogs.length;
    const metricTotals: Record<string, any> = {};

    // Inicializa
    metrics.forEach(m => { metricTotals[m.id] = { name: m.name, unit: m.unit, total: 0 }; });

    // Soma
    metricLogs.forEach(log => {
      if (metricTotals[log.metric_id]) {
          metricTotals[log.metric_id].total += log.value;
      }
    });

    // Médias
    const calculatedTotals = Object.values(metricTotals).map(mt => ({
      ...mt,
      avg: totalDays > 0 ? parseFloat((mt.total / totalDays).toFixed(1)) : 0,
    }));

    if (!metric || !selectedMetricId) {
        return { chartData: { labels: [], datasets: [{ data: [] }] }, selectedMetric: null, totalStats: calculatedTotals };
    }

    // Dados do Gráfico (7 dias)
    const todayDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const day = new Date(todayDate);
      day.setDate(todayDate.getDate() - i);
      const dateString = formatDate(day);

      const log = metricLogs.find(l => l.date === dateString && l.metric_id === selectedMetricId);
      labels.push(day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''));
      values.push(log?.value || 0);
    }

    return {
        chartData: { labels, datasets: [{ data: values }] },
        selectedMetric: metric,
        totalStats: calculatedTotals
    };
  }, [dailyLogs, metricLogs, selectedMetricId, metrics]);

  // Configuração do Gráfico com Cor Dinâmica
  const chartConfig = {
    backgroundColor: theme?.card || '#fff',
    backgroundGradientFrom: theme?.card || '#fff',
    backgroundGradientTo: theme?.card || '#fff',
    decimalPlaces: 1,
    color: (opacity = 1) => {
        const hex = theme?.primary || '#000';
        const rgb = hexToRgb(hex);
        if (rgb) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        }
        return `rgba(0, 0, 0, ${opacity})`;
    },
    labelColor: (opacity = 1) => theme?.textSecondary ? theme.textSecondary : `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: theme?.primary || '#333' }
  };

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="Calculando estatísticas..." theme={safeTheme} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Estatísticas', headerShown: false }} />
      <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}>
        <Text style={styles.pageTitle}>Estatísticas</Text>

        {/* Resumo */}
        <Text style={styles.sectionTitle}>Resumo Geral</Text>
        <View style={styles.metricsGrid}>
          {totalStats.length === 0 && <Text style={styles.emptyText}>Sem métricas registradas.</Text>}
          {totalStats.map(stat => (
            <StatCard key={stat.name} label={`Total ${stat.name}`} value={stat.total} unit={stat.unit} colors={theme} />
          ))}
          {totalStats.map(stat => (
            <StatCard key={`avg-${stat.name}`} label={`Média ${stat.name}`} value={stat.avg} unit={`${stat.unit}/dia`} colors={theme} />
          ))}
        </View>

        {/* Heatmap de Hábitos */}
        <Text style={styles.sectionTitle}>Hábitos (Últimos 21 dias)</Text>
        <View style={styles.chartCard}>
            {habits.length > 0 ? (
                habits.map(habit => (
                    <HabitHeatmap
                        key={habit.id}
                        habit={habit}
                        completions={habitCompletionsMap[habit.id] || []}
                        days={7}
                    />
                ))
            ) : (
                <Text style={styles.emptyText}>Nenhum hábito ativo encontrado.</Text>
            )}
        </View>

        {/* Gráfico */}
        <Text style={styles.sectionTitle}>Gráfico Semanal</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricScroller}>
          {metrics.map(metric => (
            <TouchableOpacity
                key={metric.id}
                style={[styles.metricButton, selectedMetricId === metric.id && styles.metricButtonSelected]}
                onPress={() => setSelectedMetricId(metric.id)}
            >
              <Feather name={metric.icon as any} size={16} color={selectedMetricId === metric.id ? theme.card : theme.primary} />
              <Text style={[styles.metricButtonText, selectedMetricId === metric.id && styles.metricButtonTextSelected]}>{metric.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeButton, chartType === 'bar' && styles.typeButtonSelected]} onPress={() => setChartType('bar')}>
            <Feather name="bar-chart-2" size={16} color={chartType === 'bar' ? theme.card : theme.primary} />
            <Text style={[styles.typeButtonText, chartType === 'bar' && styles.typeButtonTextSelected]}>Barras</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeButton, chartType === 'line' && styles.typeButtonSelected]} onPress={() => setChartType('line')}>
            <Feather name="trending-up" size={16} color={chartType === 'line' ? theme.card : theme.primary} />
            <Text style={[styles.typeButtonText, chartType === 'line' && styles.typeButtonTextSelected]}>Linha</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartCard}>
          {!selectedMetric ? <Text style={styles.emptyText}>Selecione uma métrica acima.</Text> : (
            <>
              <Text style={styles.cardTitle}>{selectedMetric.name} (7 dias)</Text>
              {chartType === 'bar' ? (
                <BarChart
                    data={chartData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chartStyle}
                    fromZero={true}
                    yAxisSuffix={` ${selectedMetric.unit}`}
                    showValuesOnTopOfBars={true}
                    yAxisLabel=""
                />
              ) : (
                <LineChart
                    data={chartData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chartStyle}
                    fromZero={true}
                    yAxisSuffix={` ${selectedMetric.unit}`}
                    yAxisLabel=""
                />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default StatsScreen;