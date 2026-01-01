import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Goal } from '../../database/goals';

interface YearViewProps {
  goals: Goal[];
  onAddGoal: () => void;
  onToggleGoal: (id: string, completed: boolean) => void;
  onDeleteGoal: (id: string) => void;
}

const YearView: React.FC<YearViewProps> = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal }) => {
  const { theme } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      borderStyle: 'dashed',
      marginBottom: 20,
    },
    addButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    goalItem: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    checkboxCompleted: {
      backgroundColor: theme.primary,
    },
    goalText: {
      fontSize: 16,
      color: theme.text,
      flex: 1,
    },
    goalTextCompleted: {
      textDecorationLine: 'line-through',
      color: theme.textSecondary,
    },
    deleteButton: {
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.textSecondary,
        fontStyle: 'italic',
        marginTop: 20
    }
  }), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={onAddGoal}>
        <Feather name="plus" size={20} color={theme.textSecondary} />
        <Text style={styles.addButtonText}>Adicionar Meta Anual</Text>
      </TouchableOpacity>

      {goals.length === 0 ? (
          <Text style={styles.emptyText}>Defina suas grandes metas para este ano.</Text>
      ) : (
          goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <TouchableOpacity 
                style={[styles.checkbox, goal.completed === 1 && styles.checkboxCompleted]}
                onPress={() => onToggleGoal(goal.id, goal.completed === 1)}
              >
                {goal.completed === 1 && <Feather name="check" size={16} color={theme.card} />}
              </TouchableOpacity>
              
              <Text style={[styles.goalText, goal.completed === 1 && styles.goalTextCompleted]}>
                {goal.description}
              </Text>

              <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteGoal(goal.id)}>
                  <Feather name="trash-2" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ))
      )}
    </View>
  );
};

export default YearView;