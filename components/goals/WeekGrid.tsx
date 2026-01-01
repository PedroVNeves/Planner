import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { getWeek } from 'date-fns';

interface WeekGridProps {
  year: number;
  onWeekPress: (week: string) => void;
  goalCounts: Record<string, { total: number, completed: number }>;
}

const WeekGrid: React.FC<WeekGridProps> = ({ year, onWeekPress, goalCounts }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'center',
    },
    weekBlock: {
      width: 32,
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekText: {
        fontSize: 10,
        color: theme.textSecondary,
    }
  }), [theme]);

  const weeks = Array.from({ length: 53 }, (_, i) => i + 1);
  const currentWeek = getWeek(new Date(), { weekStartsOn: 1 });
  const currentYear = new Date().getFullYear();

  const getBlockStyle = (weekNum: number, stats: { total: number, completed: number } | undefined) => {
      const style: any[] = [styles.weekBlock];
      if (year === currentYear && weekNum === currentWeek) {
         style.push({ borderColor: theme.primary, borderWidth: 2 });
      }
      if (stats && stats.total > 0) {
          const progress = stats.completed / stats.total;
          if (progress === 1) style.push({ backgroundColor: theme.primary, borderColor: theme.primary });
          else if (progress > 0) style.push({ backgroundColor: theme.primary + '80' });
      }
      return style;
  };

  return (
    <View style={styles.container}>
      {weeks.map((week) => {
        const weekKey = `${year}-W${String(week).padStart(2, '0')}`;
        const stats = goalCounts[weekKey];

        return (
          <TouchableOpacity
            key={weekKey}
            style={getBlockStyle(week, stats)}
            onPress={() => onWeekPress(weekKey)}
          >
             {(!stats || stats.total === 0) && <Text style={styles.weekText}>{week}</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default WeekGrid;