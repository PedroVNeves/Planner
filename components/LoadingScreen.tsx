import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme, ColorPalette } from '../theme';

interface LoadingScreenProps {
  message?: string;
  theme?: ColorPalette;
}

// Fallback theme for when LoadingScreen is rendered outside ThemeProvider
const FALLBACK_THEME: ColorPalette = {
  background: '#F0F4F8',
  card: '#FFFFFF',
  text: '#102A43',
  textSecondary: '#627D98',
  primary: '#334E68',
  accent: '#3EBD93',
  border: '#D9E2EC',
};

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "A carregar...", theme: propTheme }) => {
  // Try to get theme from context, but use fallback if context is not available
  let contextTheme: ColorPalette | undefined;
  try {
    const themeContext = useTheme();
    contextTheme = themeContext?.theme;
  } catch (error) {
    // Context not available, will use fallback
    contextTheme = undefined;
  }

  const theme = propTheme || contextTheme || FALLBACK_THEME;
  const styles = getDynamicStyles(theme);

  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={styles.loaderText}>{message}</Text>
    </View>
  );
};

const getDynamicStyles = (colors: ColorPalette) => {
  return StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loaderText: {
      marginTop: 12,
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    }
  });
};

export default LoadingScreen;