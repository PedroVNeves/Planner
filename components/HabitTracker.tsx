import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@expo/vector-icons';
import { Habit, HabitCompletion } from '../database/habits';

interface HabitTrackerProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggle: (habitId: string, completed: boolean) => void;
  date: string;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, completions, onToggle, date }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const c = theme || { card: '#eee', text: '#000', textSecondary: '#666' } as any;
    return StyleSheet.create({
      habitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
      checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
      habitTitle: { fontSize: 16, color: c.text, flex: 1 },
      habitTitleCompleted: { textDecorationLine: 'line-through', color: c.textSecondary, opacity: 0.7 },
    });
  }, [theme]);

  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    (completions || []).filter(c => c.date === date).forEach(c => {
      if (c.completed) {
        map.set(c.habit_id, true);
      }
    });
    return map;
  }, [completions, date]);

  return (
    <View>
      {(habits || []).map(habit => {
        const isCompleted = completionMap.has(habit.id);
        const habitColor = habit.color || theme.primary;

        return (
          <TouchableOpacity key={habit.id} style={styles.habitRow} onPress={() => onToggle(habit.id, !isCompleted)}>
            <View style={[styles.checkbox, { borderColor: habitColor }, isCompleted && { backgroundColor: habitColor }]}>
              {isCompleted && <Feather name="check" size={16} color="#fff" />}
            </View>
            <Text style={[styles.habitTitle, isCompleted && styles.habitTitleCompleted]}>{habit.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default HabitTracker;