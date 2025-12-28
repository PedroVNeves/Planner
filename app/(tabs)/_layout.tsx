import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Importação crucial
import { useTheme } from '../../theme';

export default function TabsLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // Pega as medidas de segurança do dispositivo

  // Cores de segurança
  const bgColor = theme?.card || '#ffffff';
  const activeColor = theme?.primary || '#000000';
  const inactiveColor = theme?.textSecondary || '#888888';
  const borderColor = theme?.border || '#e5e5e5';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          // AQUI ESTÁ A CORREÇÃO:
          // Somamos a altura base (60) + a área de segurança de baixo (insets.bottom)
          height: 60 + insets.bottom, 
          // Empurramos os ícones para cima para não ficarem colados na barra do Android
          paddingBottom: insets.bottom + 5, 
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Estatísticas */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" color={color} size={size} />
          ),
        }}
      />

      {/* 2. Métricas */}
      <Tabs.Screen
        name="metrics"
        options={{
          title: 'Métricas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" color={color} size={size} />
          ),
        }}
      />

      {/* 3. Metas */}
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag" color={color} size={size} />
          ),
        }}
      />

      {/* 4. Home (Centro - Destaque) */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              color={color} 
              size={size + 4} 
            />
          ),
        }}
      />

      {/* 5. Hábitos */}
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Hábitos',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" color={color} size={size} />
          ),
        }}
      />

      {/* 6. Biblioteca */}
      <Tabs.Screen
        name="library"
        options={{
          title: 'Livros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" color={color} size={size} />
          ),
        }}
      />

      {/* 7. Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}