import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// Seus Contextos e Banco de Dados
import { AppProvider } from '../context/AppContext';
import { ThemeProvider } from '../theme';
import { initDatabase } from '../database';

export default function RootLayout() {
  useEffect(() => {
    // Inicializa o SQLite ao abrir o app
    initDatabase();
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <View style={{ flex: 1 }}>
          <StatusBar style="auto" />
          {/* O Slot é crucial! Ele diz: "Renderize a rota atual aqui".
            Se você estiver em /dashboard, ele renderiza (tabs).
            Se estiver em /planner, renderiza o arquivo planner.
          */}
          <Slot />
        </View>
      </ThemeProvider>
    </AppProvider>
  );
}