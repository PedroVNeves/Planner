
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, ColorPalette } from '../../theme';

export default function AccountScreen() {
  const { theme } = useTheme();
  const styles = getDynamicStyles(theme);

  const handleComingSoon = () => {
    Alert.alert(
      "Função Em Breve",
      "Esta funcionalidade será implementada em breve."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Gestão da sua conta e segurança.
      </Text>
      
      {/* Botão de Redefinir Palavra-passe (agora desativado) */}
      <TouchableOpacity 
        style={[styles.button, styles.disabledButton]} 
        onPress={handleComingSoon}
      >
        <Feather name="lock" size={20} color={theme.textSecondary} />
        <Text style={[styles.buttonText, styles.disabledText]}>Redefinir Palavra-passe</Text>
      </TouchableOpacity>

      {/* Botão de Apagar Conta */}
      <TouchableOpacity 
        style={[styles.button, styles.destructiveButton]} 
        onPress={handleComingSoon}
      >
        <Feather name="trash-2" size={20} color="#ef4444" />
        <Text style={[styles.buttonText, styles.destructiveText]}>Apagar Conta Permanentemente</Text>
      </TouchableOpacity>
    </View>
  );
}

const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  destructiveButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  destructiveText: {
    color: '#ef4444',
  },
});
