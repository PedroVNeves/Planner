
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { HabitCompletion } from '../database/habits';
import { subDays, format, isSameDay } from 'date-fns';

interface HabitHeatmapProps {
  habit: {
    id: string;
    title: string;
  };
  completions: HabitCompletion[];
  days: number;
}

const HabitHeatmap: React.FC<HabitHeatmapProps> = ({ habit, completions, days }) => {
  const { theme } = useTheme();

  // 🛡️ Estilos com Cores do Tema
  const styles = useMemo(() => StyleSheet.create({
    habitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    habitName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      flex: 1, // Allow name to take available space and shrink
      marginRight: 10,
    },
    heatmapContainer: {
      flexDirection: 'row',
    },
    dayBlock: {
      width: 20,
      height: 20,
      borderRadius: 5,
      marginHorizontal: 2,
      backgroundColor: theme.border, // Cor padrão para 'não preenchido'
    },
    dayBlockCompleted: {
      backgroundColor: theme.primary, // Cor para 'concluído'
    },
  }), [theme]);

  // Cria um mapa de conclusões para busca rápida
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    completions.forEach(c => {
      if (c.completed) {
        map.set(c.date, true);
      }
    });
    return map;
  }, [completions]);


  // Gera os últimos N dias
  const dateBlocks = useMemo(() => {
    const blocks = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      blocks.push({
        date,
        dateString,
        isCompleted: completionMap.has(dateString),
      });
    }
    return blocks;
  }, [days, completionMap]);

  return (
    <View style={styles.habitRow}>
      <Text style={styles.habitName} numberOfLines={1}>{habit.title}</Text>
      <View style={styles.heatmapContainer}>
        {dateBlocks.map(({ dateString, isCompleted }) => (
          <View
            key={dateString}
            style={[
              styles.dayBlock,
              isCompleted && styles.dayBlockCompleted,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default HabitHeatmap;
