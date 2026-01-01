
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { format, getDay, getYear, eachDayOfInterval, startOfYear, endOfYear, getMonth, getDate, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdvancedHabitHeatmapProps {
  habit: {
    id: string;
    title: string;
    color: string;
  };
  completions: { date: string; completed: number }[];
  year: number;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const AdvancedHabitHeatmap: React.FC<AdvancedHabitHeatmapProps> = ({ habit, completions, year }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: habit.color || theme.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    heatmapGrid: {
      flexDirection: 'row',
    },
    weekDayColumn: {
      alignItems: 'center',
      marginRight: 4,
    },
    weekDayText: {
      fontSize: 10,
      color: theme.textSecondary,
      height: 14,
      textAlign: 'center',
    },
    monthsContainer: {
        flexDirection: 'row',
        marginLeft: 28, // Align with day cells
        marginBottom: 4,
    },
    monthLabel: {
        fontSize: 10,
        color: theme.textSecondary,
        width: (14 * 4.4), // Approximate width of 4.4 weeks
        textAlign: 'center',
    },
    daysContainer: {
      flexDirection: 'row',
    },
    dayCell: {
      width: 14,
      height: 14,
      borderRadius: 3,
      backgroundColor: theme.border,
      margin: 2,
    },
  }), [theme, habit.color]);
  
  const { yearData, monthLabels } = useMemo(() => {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    const daysInYear = eachDayOfInterval({ start: startDate, end: endDate });

    const completionMap = new Map<string, boolean>();
    completions.forEach(c => {
      if (c.completed) completionMap.set(c.date, true);
    });

    const yearData: { date: Date; isCompleted: boolean }[][] = Array.from({ length: 7 }, () => []);
    const monthLabels: { label: string, position: number }[] = [];
    let lastMonth = -1;

    daysInYear.forEach((day, index) => {
      const dayOfWeek = getDay(day);
      const dateString = format(day, 'yyyy-MM-dd');
      
      // Add blank cells to align the first day of the year
      if (index === 0 && dayOfWeek > 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          yearData[i].push(null);
        }
      }
      
      yearData[dayOfWeek].push({
        date: day,
        isCompleted: completionMap.has(dateString),
      });

      const currentMonth = getMonth(day);
      if (currentMonth !== lastMonth) {
        monthLabels.push({ label: MONTHS[currentMonth], position: yearData[0].length - 1 });
        lastMonth = currentMonth;
      }
    });

    return { yearData, monthLabels };
  }, [year, completions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{habit.title} - {year}</Text>
      
      <View style={styles.monthsContainer}>
        {monthLabels.map((month, index) => (
          <Text key={index} style={[styles.monthLabel, {left: month.position * 18 - (month.position > 5 ? 10 : 0) }]}>{month.label}</Text>
        ))}
      </View>
      
      <View style={styles.heatmapGrid}>
        <View style={styles.weekDayColumn}>
            {/* Empty space for month alignment */}
            <View style={{height: 14}}/> 
            {WEEK_DAYS.map(day => (
                <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.daysContainer}>
            {yearData[0].map((_, weekIndex) => (
                <View key={weekIndex}>
                {yearData.map((dayData, dayIndex) => {
                    const day = dayData[weekIndex];
                    if (!day) return <View key={`${weekIndex}-${dayIndex}`} style={styles.dayCell} />;
                    
                    const opacity = day.isCompleted ? 1 : 0.2;
                    const cellColor = day.isCompleted ? habit.color : theme.border;
                    
                    return (
                    <View
                        key={day.date.toISOString()}
                        style={[
                        styles.dayCell,
                        { backgroundColor: cellColor, opacity },
                        isSameDay(day.date, new Date()) && { borderWidth: 1, borderColor: theme.primary }
                        ]}
                    />
                    );
                })}
                </View>
            ))}
            </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default AdvancedHabitHeatmap;
