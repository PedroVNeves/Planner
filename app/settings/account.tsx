import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
// --- 1. IMPORTAÇÕES ATUALIZADAS ---
import { useAppContext, ColorPalette } from '../../context/AppContext';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function AccountScreen() {
  // --- 2. TEMA ADICIONADO ---
  const { auth, user, theme } = useAppContext();
  const [loading, setLoading] = useState(false);

  // --- 3. ESTILOS DINÂMICOS ---
  const styles = getDynamicStyles(theme);

  // (A lógica 'handlePasswordReset' e 'handleDeleteAccount' não muda)
  const handlePasswordReset = async () => {
    if (!auth || !user?.email) {
      Alert.alert("Erro", "Não foi possível encontrar o seu email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        "Verifique o seu Email",
        `Enviámos um link de redefinição de palavra-passe para ${user.email}.`
      );
    } catch (error: any) {
      console.error("Erro ao redefinir palavra-passe:", error);
      Alert.alert("Erro", "Não foi possível enviar o email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Função Em Breve",
      "Apagar a conta requer reautenticação. Esta funcionalidade será implementada em breve."
    );
  };

  return (
    // --- 4. JSX ATUALIZADO (com estilos dinâmicos) ---
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Gestão da sua conta e segurança.
      </Text>
      
      {/* Botão de Redefinir Palavra-passe */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePasswordReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.primary} /> // <-- Dinâmico
        ) : (
          <>
            <Feather name="lock" size={20} color={theme.primary} />
            <Text style={styles.buttonText}>Enviar Email de Redefinição de Palavra-passe</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Botão de Apagar Conta */}
      <TouchableOpacity 
        style={[styles.button, styles.destructiveButton]} 
        onPress={handleDeleteAccount}
      >
        <Feather name="trash-2" size={20} color="#ef4444" />
        <Text style={[styles.buttonText, styles.destructiveText]}>Apagar Conta Permanentemente</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- 5. FÁBRICA DE ESTILOS DINÂMICOS ---
const getDynamicStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background, // <-- Dinâmico
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary, // <-- Dinâmico
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card, // <-- Dinâmico
    borderColor: colors.border, // <-- Dinâmico
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    color: colors.primary, // <-- Dinâmico
    fontWeight: '600',
    marginLeft: 12,
  },
  destructiveButton: {
    // Cores de perigo são, por norma, fixas
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  destructiveText: {
    color: '#ef4444',
  },
});