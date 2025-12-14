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
import { useAppContext } from '../../context/AppContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDB } from '../../database'; // SQLite

const LoginScreen = () => {
  const { setSessionUser } = useAppContext(); 
  const insets = useSafeAreaInsets();

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
        const db = getDB();
        // Consulta simples (Atenção: senhas em texto puro para MVP local)
        const user = db.getFirstSync(
            'SELECT * FROM users WHERE email = ? AND password = ?', 
            [email, password]
        ) as any;

        if (user) {
             // Sucesso!
             if (setSessionUser) {
                 setSessionUser({ uid: user.id, displayName: user.username, email: user.email });
             }
             router.replace('/(tabs)/dashboard');
        } else {
             setError("Credenciais inválidas.");
        }

    } catch (e: any) {
      console.error("Erro login:", e);
      setError("Ocorreu um erro ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.authContainer, { paddingTop: insets.top }]} 
    >
      <Text style={styles.authTitle}>Bem-vindo!</Text>
      <Text style={styles.authSubtitle}>Aceda ao seu planeamento local.</Text>

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
          Não tem perfil? <Text style={{ fontWeight: 'bold', color: '#0ea5e9' }}>Criar um</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

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