import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useTheme, ColorPalette } from '../theme';
import { useGamification } from '../hooks/useGamification';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Quest {
  title: string;
  description: string;
  goal: number;
  icon: any;
}

const quests: Quest[] = [
  { title: 'Ofensiva de 7 Dias', description: 'Mantenha uma ofensiva de 7 dias seguidos para ganhar uma vida extra.', goal: 7, icon: 'zap' },
  { title: 'Ofensiva de 14 Dias', description: 'Mantenha uma ofensiva de 14 dias para provar sua consistência e ganhar outra vida.', goal: 14, icon: 'award' },
  { title: 'Ofensiva de 21 Dias', description: 'Complete 3 semanas seguidas de ofensiva para se tornar um mestre dos hábitos.', goal: 21, icon: 'award' },
  { title: 'Ofensiva de 30 Dias', description: 'Um mês inteiro! Você está no caminho da excelência.', goal: 30, icon: 'shield' },
];

export default function QuestsScreen() {
  const { theme } = useTheme();
  const { stats } = useGamification();
  const insets = useSafeAreaInsets();
  const styles = getDynamicStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.subtitle}>
        Complete as missões para ganhar recompensas e fortalecer seus hábitos.
      </Text>

      <View style={styles.questsList}>
        {quests.map((quest) => {
          const isCompleted = stats.current_streak >= quest.goal;
          return (
            <View key={quest.title} style={[styles.questCard, isCompleted && styles.questCardCompleted]}>
              <View style={[styles.iconContainer, isCompleted && styles.iconContainerCompleted]}>
                  <Feather name={quest.icon} size={24} color={isCompleted ? theme.card : theme.primary} />
              </View>
              <View style={styles.questDetails}>
                <Text style={[styles.questTitle, isCompleted && styles.questTextCompleted]}>{quest.title}</Text>
                <Text style={[styles.questDescription, isCompleted && styles.questTextCompleted]}>{quest.description}</Text>
                
                {/* Barra de Progresso */}
                <View style={styles.progressBarBackground}>
                  <View style={[
                      styles.progressBarFill, 
                      { width: `${Math.min((stats.current_streak / quest.goal) * 100, 100)}%` }
                  ]} />
                </View>
                <Text style={styles.progressText}>{isCompleted ? 'Completo!' : `${stats.current_streak} / ${quest.goal} dias`}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 24,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  questsList: {
      gap: 16,
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  questCardCompleted: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
  },
  iconContainer: {
      backgroundColor: colors.primary + '15',
      padding: 12,
      borderRadius: 12,
      marginRight: 16,
  },
  iconContainerCompleted: {
      backgroundColor: colors.primary,
  },
  questDetails: {
      flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  questTextCompleted: {
      color: colors.primary,
  },
  questDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  progressBarBackground: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
      overflow: 'hidden',
  },
  progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
  },
  progressText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
      textAlign: 'right',
  }
});
