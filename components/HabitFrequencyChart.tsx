
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Habit {
  id: string;
  title: string;
  color: string;
}

interface Completion {
  habit_id: string;
  completed: number;
}

interface HabitFrequencyChartProps {
  habits: Habit[];
  completions: Completion[];
  limit?: number;
}

const HabitFrequencyChart: React.FC<HabitFrequencyChartProps> = ({ habits, completions, limit = 5 }) => {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const frequencyMap = new Map<string, number>();
    completions.forEach(c => {
      if (c.completed) {
        frequencyMap.set(c.habit_id, (frequencyMap.get(c.habit_id) || 0) + 1);
      }
    });

    return habits
      .map(habit => ({
        ...habit,
        count: frequencyMap.get(habit.id) || 0,
      }))
      .filter(habit => habit.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [habits, completions, limit]);

  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(item => item.count));
  }, [chartData]);
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      },
      chart: {
        marginTop: 16,
      },
      barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      },
      barLabel: {
        width: '30%',
        fontSize: 14,
        color: theme.text,
        marginRight: 8,
      },
      bar: {
        height: 24,
        justifyContent: 'center',
        paddingHorizontal: 8,
        borderRadius: 4,
      },
      barText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12,
      },
      emptyText: {
        textAlign: 'center',
        color: theme.textSecondary,
        fontStyle: 'italic',
      }
  }), [theme]);

  if (chartData.length === 0) {
    return (
        <View style={styles.container}>
            <Text style={styles.emptyText}>Nenhuma conclusão de hábito registrada ainda.</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {chartData.map(item => (
          <View key={item.id} style={styles.barContainer}>
            <Text style={styles.barLabel} numberOfLines={1}>{item.title}</Text>
            <View
              style={[
                styles.bar,
                {
                  width: `${(item.count / maxValue) * 70}%`,
                  backgroundColor: item.color || theme.primary,
                },
              ]}
            >
              <Text style={styles.barText}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default HabitFrequencyChart;
