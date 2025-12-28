
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Feather } from '@expo/vector-icons';

type Habit = {
  id: string;
  title: string;
};

type HabitCompletion = {
  habit_id: string;
  date: string;
  completed: number;
};

interface HabitTrackerProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onToggle: (habitId: string, completed: boolean) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, completions, onToggle }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
      habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
      },
      checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: c.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      checkboxCompleted: {
        backgroundColor: c.primary,
      },
      habitTitle: {
        fontSize: 16,
        color: c.text,
        flex: 1,
      },
      habitTitleCompleted: {
        textDecorationLine: 'line-through',
        color: c.textSecondary,
      },
    });
  }, [theme]);

  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    completions.forEach(c => {
      if (c.completed) {
        map.set(c.habit_id, true);
      }
    });
    return map;
  }, [completions]);

  return (
    <View>
      {habits.map(habit => {
        const isCompleted = completionMap.has(habit.id);
        return (
          <TouchableOpacity
            key={habit.id}
            style={styles.habitRow}
            onPress={() => onToggle(habit.id, !isCompleted)}
          >
            <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
              {isCompleted && <Feather name="check" size={16} color={theme.card} />}
            </View>
            <Text style={[styles.habitTitle, isCompleted && styles.habitTitleCompleted]}>
              {habit.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default HabitTracker;
