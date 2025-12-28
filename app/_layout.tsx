import { AppDataProvider } from '../context/AppDataContext';
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../theme';
import { ThemeProvider } from '../theme';
import { UserProvider } from '../context/UserContext';
import { initDatabase } from '../database';
import LoadingScreen from '../components/LoadingScreen';

function RootStack() {
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="daily-detail" options={{ headerShown: false }} />
      <Stack.Screen name="quests" options={{ title: 'Missões' }} />

      <Stack.Screen name="weekly-view" options={{ title: 'Visão Semanal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (e) {
        setError(e as Error);
        console.error("Failed to initialize database", e);
      }
    };
    setup();
  }, []);

  if (!dbReady) {
    // A loading screen component would be ideal here
    return <LoadingScreen message={error ? `Error: ${error.message}`: "Initializing database..."} theme={{background: '#121212', text: '#fff'}} />;
  }

  return (
    <UserProvider>
      <ThemeProvider>
        <AppDataProvider>
          <RootStack />
        </AppDataProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
