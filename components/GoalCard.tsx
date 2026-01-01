
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Goal } from '../app-logic/goals';

interface GoalCardProps {
  goal: Goal;
  onPress: () => void;
  onToggleComplete: () => void;
  onAddSubGoal: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, onToggleComplete, onAddSubGoal }) => {
  const { theme } = useTheme();
  const isCompleted = goal.status === 'COMPLETED';

  const progressPercent = goal.progressType === 'PERCENTAGE' 
    ? (goal.progress / goal.target) * 100 
    : (goal.subGoals.filter(sg => sg.status === 'COMPLETED').length / goal.subGoals.length) * 100;

  const styles = useMemo(() => {
    const c = theme || { background: '#fff', card: '#eee', text: '#000', primary: '#333', border: '#ccc', textSecondary: '#666', accent: 'green' } as any;
    return StyleSheet.create({
      card: {
        backgroundColor: c.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: c.border,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: isCompleted ? c.textSecondary : c.text,
        textDecorationLine: isCompleted ? 'line-through' : 'none',
        flex: 1,
      },
      description: {
        fontSize: 14,
        color: c.textSecondary,
        marginBottom: 12,
      },
      progressBarContainer: {
        height: 8,
        borderRadius: 4,
        backgroundColor: c.border,
        marginVertical: 8,
      },
      progressBar: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: c.primary,
      },
      subGoalContainer: {
        marginTop: 12,
        paddingLeft: 16,
        borderLeftWidth: 2,
        borderLeftColor: c.border,
      },
      subGoalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
      },
      subGoalTitle: {
        fontSize: 15,
        color: c.textSecondary,
        marginLeft: 8,
      },
       actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 12,
      },
      actionButton: {
        marginLeft: 16,
      }
    });
  }, [theme, isCompleted]);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onToggleComplete}>
          <Feather
            name={isCompleted ? 'check-circle' : 'circle'}
            size={24}
            color={isCompleted ? theme.accent : theme.textSecondary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { marginLeft: 12 }]}>{goal.title}</Text>
      </View>

      {goal.description && <Text style={styles.description}>{goal.description}</Text>}

      {goal.subGoals.length > 0 && (
        <>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.subGoalContainer}>
            {goal.subGoals.map(sg => (
              <View key={sg.id} style={styles.subGoalRow}>
                <Feather
                  name={sg.status === 'COMPLETED' ? 'check-square' : 'square'}
                  size={16}
                  color={theme.textSecondary}
                />
                <Text style={styles.subGoalTitle}>{sg.title}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={onAddSubGoal} style={styles.actionButton}>
          <Feather name="plus-circle" size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default GoalCard;
