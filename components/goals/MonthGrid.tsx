import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../theme';

interface MonthGridProps {
  year: number;
  onMonthPress: (month: string) => void;
  goalCounts: Record<string, { total: number, completed: number }>;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const MonthGrid: React.FC<MonthGridProps> = ({ year, onMonthPress, goalCounts }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
    },
    card: {
      width: '48%', // 2 columns
      aspectRatio: 1.4,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
    },
    monthName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    progressContainer: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      width: '100%',
      marginTop: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    stats: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 4,
        textAlign: 'right'
    },
    emptyText: {
        fontSize: 12,
        color: theme.textSecondary,
        fontStyle: 'italic',
        marginTop: 8
    }
  }), [theme]);

  return (
    <View style={styles.container}>
      {MONTHS.map((month, index) => {
        const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
        const stats = goalCounts[monthKey] || { total: 0, completed: 0 };
        const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

        return (
          <TouchableOpacity
            key={monthKey}
            style={styles.card}
            onPress={() => onMonthPress(monthKey)}
          >
            <Text style={styles.monthName}>{month}</Text>
            
            <View>
                {stats.total > 0 ? (
                    <>
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.stats}>{stats.completed}/{stats.total} metas</Text>
                    </>
                ) : (
                    <Text style={styles.emptyText}>Toque para planejar</Text>
                )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MonthGrid;