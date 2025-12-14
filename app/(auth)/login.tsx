import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAppContext } from '../../context/AppContext'; // Importa o nosso hook
import { router } from 'expo-router'; // Importa o router
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Para a Status Bar

const LoginScreen = () => {
  const { auth } = useAppContext(); // Obtém o auth do contexto
  const insets = useSafeAreaInsets(); // Obtém as margens seguras

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, preencha o email e a palavra-passe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Sucesso! O AppContext (em AppProvider) vai detetar a
      // mudança de 'user' e redirecionar automaticamente.
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setError("Email ou palavra-passe incorretos.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.authContainer, { paddingTop: insets.top }]} // Adiciona padding-top
    >
      <Text style={styles.authTitle}>Bem-vindo de volta!</Text>
      <Text style={styles.authSubtitle}>Faça login para continuar.</Text>

      {error && <Text style={styles.authError}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        style={styles.input}
        placeholder="Palavra-passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity
        style={[styles.button, loading ? styles.buttonDisabled : {}]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={loading}>
        <Text style={styles.authSwitchText}>
          Não tem uma conta? <Text style={{ fontWeight: 'bold', color: '#0ea5e9' }}>Registe-se</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// Seus estilos de autenticação originais
const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#7dd3fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  authError: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  authSwitchText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
});

export default LoginScreen;