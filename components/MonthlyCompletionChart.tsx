
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { getMonth, parseISO } from 'date-fns';

interface Completion {
  date: string;
  completed: number;
}

interface MonthlyCompletionChartProps {
  completions: Completion[];
  year: number;
  color: string;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const MonthlyCompletionChart: React.FC<MonthlyCompletionChartProps> = ({ completions, year, color }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const monthlyCompletions = Array(12).fill(0);
    const daysInMonth = [31, year % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    completions.forEach(c => {
      const date = parseISO(c.date);
      if (date.getFullYear() === year && c.completed) {
        const month = getMonth(date);
        monthlyCompletions[month]++;
      }
    });

    return monthlyCompletions.map((count, index) => ({
      month: MONTHS[index],
      percentage: (count / daysInMonth[index]) * 100,
    }));
  }, [completions, year]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginTop: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 16,
    },
    chart: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 150,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: '60%',
      backgroundColor: color || theme.primary,
      borderRadius: 4,
    },
    barLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
  }), [theme, color]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Taxa de Conclusão Mensal (%)</Text>
        <View style={styles.chart}>
        {chartData.map((data, index) => (
            <View key={index} style={styles.barContainer}>
            <View style={[styles.bar, { height: `${Math.max(data.percentage, 5)}%` }]} />
            <Text style={styles.barLabel}>{data.month}</Text>
            </View>
        ))}
        </View>
    </View>
  );
};

export default MonthlyCompletionChart;
