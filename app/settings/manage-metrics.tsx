import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Keyboard
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import { useMetricSettings, Metric } from '../../hooks/useMetricSettings';
import LoadingScreen from '../../components/LoadingScreen';

export default function ManageMetricsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { metrics, loading, addMetric, deleteMetric, toggleMetricVisibility } = useMetricSettings();
  
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', card: '#eee', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        
        // Cabeçalho
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 16,
            // paddingTop dinâmico
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            marginBottom: 16,
            backgroundColor: c.background,
        },
        backButton: { padding: 8, marginRight: 12, marginLeft: -8 },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: c.text },

        // Conteúdo
        scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
        subtitle: { fontSize: 14, color: c.textSecondary, marginBottom: 20, fontStyle: 'italic' },

        // Formulário
        formContainer: { flexDirection: 'row', marginBottom: 24, alignItems: 'center' },
        inputName: { flex: 2, backgroundColor: c.card, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, marginRight: 8 },
        inputUnit: { flex: 1, backgroundColor: c.card, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, marginRight: 8, textAlign: 'center' },
        inputTarget: { flex: 1, backgroundColor: c.card, color: c.text, borderColor: c.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, marginRight: 8, textAlign: 'center' },
        addButton: { backgroundColor: c.primary, padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
        buttonDisabled: { opacity: 0.6 },

        // Lista
        listTitle: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 12 },
        listContainer: { backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
        itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: c.border },
        itemTextContainer: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 },
        itemLabel: { fontSize: 16, marginLeft: 12, color: c.text, fontWeight: '500', flexShrink: 1 },
        itemUnit: { fontSize: 14, color: c.textSecondary, marginLeft: 4 },
        controlsContainer: { flexDirection: 'row', alignItems: 'center' },
        
        emptyText: { fontSize: 14, color: c.textSecondary, fontStyle: 'italic', textAlign: 'center', padding: 20 },
    });
  }, [theme]);

  const handleAddMetric = async () => {
    if (!newName.trim() || !newUnit.trim()) {
      Alert.alert("Erro", "Preencha nome e unidade.");
      return;
    }
    
    setIsAdding(true);
    try {
      // Se você tiver suporte a 'target' no addMetric, passe aqui. 
      // Senão, pode ignorar o newTarget ou atualizar o hook depois.
      // Assumindo assinatura: (name, unit, icon, target?)
      await addMetric(newName.trim(), newUnit.trim(), 'bar-chart', parseInt(newTarget) || 0);
      
      setNewName('');
      setNewUnit('');
      setNewTarget('');
      Keyboard.dismiss();
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao adicionar.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMetric = (metric: Metric) => {
    Alert.alert(
      "Apagar Métrica",
      `Deseja remover "${metric.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => deleteMetric(metric.id) }
      ]
    );
  };

  if (loading || !theme) {
    const safeTheme = theme || { background: '#fff', primary: '#333' } as any;
    return <LoadingScreen message="Carregando métricas..." theme={safeTheme} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Cabeçalho Customizado */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerir Métricas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Defina o que você quer acompanhar (ex: Páginas, Água, Exercício).
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.inputName}
            placeholder="Nome (ex: Leitura)"
            value={newName}
            onChangeText={setNewName}
            editable={!isAdding}
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={styles.inputUnit}
            placeholder="Unid."
            value={newUnit}
            onChangeText={setNewUnit}
            editable={!isAdding}
            placeholderTextColor={theme.textSecondary}
          />
           <TextInput
            style={styles.inputTarget}
            placeholder="Meta"
            value={newTarget}
            onChangeText={setNewTarget}
            keyboardType="numeric"
            editable={!isAdding}
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity 
            style={[styles.addButton, isAdding && styles.buttonDisabled]} 
            onPress={handleAddMetric}
            disabled={isAdding}
          >
            {isAdding ? <ActivityIndicator color={theme.card} size="small" /> : <Feather name="plus" size={20} color={theme.card} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle}>Minhas Métricas</Text>
        <View style={styles.listContainer}>
          {metrics.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma métrica ativa.</Text>
          )}
          
          {metrics.map(metric => (
            <View key={metric.id} style={styles.itemContainer}>
              <View style={styles.itemTextContainer}>
                <Feather name={metric.icon} size={20} color={theme.primary} />
                <Text style={styles.itemLabel}>{metric.name}</Text>
                <Text style={styles.itemUnit}>({metric.unit})</Text>
                {/* Mostra a meta se existir */}
                {(metric as any).target > 0 && <Text style={styles.itemUnit}> / {(metric as any).target}</Text>}
              </View>

              <View style={styles.controlsContainer}>
                <Switch
                  trackColor={{ false: theme.border, true: theme.primary + '80' }}
                  thumbColor={metric.isVisible ? theme.primary : theme.card}
                  onValueChange={() => toggleMetricVisibility(metric.id, metric.isVisible)}
                  value={metric.isVisible}
                />
                <TouchableOpacity onPress={() => handleDeleteMetric(metric)} style={{ marginLeft: 16 }}>
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}