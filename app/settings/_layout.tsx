import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

export default function SettingsLayout() {
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
        <Stack.Screen name="edit-name" options={{ title: 'Alterar Nome' }} />
        <Stack.Screen name="customize-theme" options={{ title: 'Personalizar Tema' }} />
        <Stack.Screen name="manage-habits" options={{ title: 'Gerir Hábitos' }} />
        <Stack.Screen name="manage-metrics" options={{ title: 'Gerir Métricas' }} />
    </Stack>
  );
}
