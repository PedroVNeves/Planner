import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

export default function DailyDetailLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="[date]" options={{ title: 'Detalhe Diário' }} />
    </Stack>
  );
}
