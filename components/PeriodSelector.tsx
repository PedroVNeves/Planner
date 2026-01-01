
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';

type PeriodType = 'YEAR' | 'MONTH' | 'WEEK';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onSelectPeriod: (period: PeriodType) => void;
  currentDate: Date;
  onChangeDate: (newDate: Date) => void;
  periodLabel: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  currentDate,
  onChangeDate,
  periodLabel,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 24,
    },
    periodTypeContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    typeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    typeButtonSelected: {
      backgroundColor: theme.primary,
    },
    typeButtonText: {
      color: theme.text,
      fontWeight: '600',
    },
    typeButtonTextSelected: {
      color: theme.card,
    },
    dateNavContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    navArrow: {
      padding: 8,
    },
    periodLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      textAlign: 'center',
      flex: 1,
    },
  });

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    const multiplier = direction === 'prev' ? -1 : 1;

    switch (selectedPeriod) {
      case 'YEAR':
        newDate.setFullYear(newDate.getFullYear() + multiplier);
        break;
      case 'MONTH':
        newDate.setMonth(newDate.getMonth() + multiplier);
        break;
      case 'WEEK':
        newDate.setDate(newDate.getDate() + 7 * multiplier);
        break;
    }
    onChangeDate(newDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.periodTypeContainer}>
        {(['WEEK', 'MONTH', 'YEAR'] as PeriodType[]).map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.typeButton, selectedPeriod === period && styles.typeButtonSelected]}
            onPress={() => onSelectPeriod(period)}
          >
            <Text style={selectedPeriod === period ? styles.typeButtonTextSelected : styles.typeButtonText}>
              {period === 'WEEK' ? 'Semana' : period === 'MONTH' ? 'Mês' : 'Ano'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateNavContainer}>
        <TouchableOpacity onPress={() => handleDateChange('prev')} style={styles.navArrow}>
          <Feather name="chevron-left" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={styles.periodLabel}>{periodLabel}</Text>
        <TouchableOpacity onPress={() => handleDateChange('next')} style={styles.navArrow}>
          <Feather name="chevron-right" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
