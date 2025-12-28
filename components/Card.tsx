import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';
// --- 1. IMPORTAÇÕES ATUALIZADAS ---
import { useTheme, ColorPalette } from '../theme';

// --- 2. PROPS ATUALIZADAS ---
type CardProps = {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: ReactNode;
  action: (event: GestureResponderEvent) => void;
  theme?: ColorPalette; // O tema pode ser passado como prop (opcional)
};

const Card: React.FC<CardProps> = ({ title, icon, children, action, theme: propTheme }) => {
  // --- 3. LÓGICA DO TEMA ---
  // Se um tema não for passado, usa o tema global do contexto
  const { theme: contextTheme } = useTheme();
  const theme = propTheme || contextTheme;

  // Gera estilos dinâmicos
  const styles = getDynamicStyles(theme);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={action}>
      <View style={styles.cardHeader}>
        {/* --- 4. CORES DINÂMICAS --- */}
        <Feather name={icon} size={22} color={theme.primary} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {/* O 'children' (filho) vai herdar os estilos de texto do Dashboard */}
      {children}
    </TouchableOpacity>
  );
};

// --- 5. FÁBRICA DE ESTILOS DINÂMICOS ---
// Substitui o StyleSheet estático
const getDynamicStyles = (colors: ColorPalette) => {
  return StyleSheet.create({
    cardContainer: {
      backgroundColor: colors.card, // <-- Dinâmico
      padding: 20,
      borderRadius: 16,
      shadowColor: '#000', // Sombra pode ser estática
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border, // <-- Dinâmico
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardIcon: {
      marginRight: 8,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text, // <-- Dinâmico
    },
  });
};

export default Card;