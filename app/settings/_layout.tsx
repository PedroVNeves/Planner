import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { AppProvider } from '../../context/AppContext';
import { ThemeProvider } from '../../theme'; // <--- Importei o ThemeProvider
import { initDatabase } from '../../database';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <AppProvider>
      {/* O ThemeProvider deve estar DENTRO do AppProvider se precisar de dados do usuário, 
          mas pode estar fora se for independente. Aqui funciona bem. */}
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
    </AppProvider>
  );
}