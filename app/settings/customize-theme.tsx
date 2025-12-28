import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme, ColorPalette, themes, ThemeType } from '../../theme';

export default function CustomizeThemeScreen() {
  const { theme, themeName, setTheme, setCustomTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Estado local com todas as cores editáveis
  const [customColors, setCustomColors] = useState<ColorPalette>(theme);
  const [loading, setLoading] = useState(false);

  // Sincroniza inputs se o tema mudar externamente
  useEffect(() => {
    setCustomColors(theme);
  }, [theme]);

  // 🛡️ Estilos Blindados
  const styles = useMemo(() => {
    const c = theme || { background: '#fff', text: '#000', card: '#eee', primary: '#333', border: '#ccc', textSecondary: '#666' } as any;
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        
        header: {
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16,
            borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.background,
        },
        backButton: { padding: 8, marginRight: 12, marginLeft: -8 },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: c.text },
        
        content: { padding: 24, paddingBottom: 100 },
        subtitle: { fontSize: 14, color: c.textSecondary, marginBottom: 24, lineHeight: 20 },
        sectionTitle: { fontSize: 18, fontWeight: 'bold', color: c.text, marginTop: 24, marginBottom: 16 },
        
        optionsContainer: { backgroundColor: c.card, borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
        
        saveButton: { backgroundColor: c.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 32, marginBottom: 40 },
        saveButtonText: { color: c.card, fontSize: 16, fontWeight: 'bold' }
    });
  }, [theme]);

  const handleSaveCustom = async () => {
    // Validação simples
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(customColors.primary);
    if (!isValidHex) {
        Alert.alert("Cor Inválida", "A cor primária precisa ser um código Hex válido (ex: #FF5733).");
        return;
    }

    setLoading(true);
    try {
      // 1. Salva o tema no contexto e banco
      await setCustomTheme(customColors);
      
      // 2. Exibe o alerta de sucesso e redireciona
      Alert.alert(
        "Sucesso!",
        "O seu tema personalizado foi salvo.",
        [
          { 
            text: "OK", 
            onPress: () => {
                router.replace('/(tabs)/dashboard');
            } 
          }
        ]
      );
      
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o tema.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (name: ThemeType) => {
      setTheme(name);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.subtitle}>
            Escolha um estilo base ou edite cada cor individualmente abaixo.
            </Text>

            {/* Presets */}
            <View style={styles.optionsContainer}>
            <ThemeOption label="Ocean Focus" icon="droplet" isSelected={themeName === 'ocean'} onPress={() => applyPreset('ocean')} colors={theme} />
            <ThemeOption label="Forest Zen" icon="wind" isSelected={themeName === 'forest'} onPress={() => applyPreset('forest')} colors={theme} />
            <ThemeOption label="Dracula" icon="moon" isSelected={themeName === 'dracula'} onPress={() => applyPreset('dracula')} colors={theme} />
            <ThemeOption label="Coffee" icon="coffee" isSelected={themeName === 'coffee'} onPress={() => applyPreset('coffee')} colors={theme} />
            <ThemeOption label="Princess" icon="gift" isSelected={themeName === 'princess'} onPress={() => applyPreset('princess')} colors={theme} />
            </View>

            <Text style={styles.sectionTitle}>Edição Manual</Text>
            
            <View style={styles.optionsContainer}>
            <ColorInput
                label="Cor Primária"
                value={customColors.primary}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, primary: t, accent: t }))}
                colors={theme}
            />
            <ColorInput
                label="Cor de Fundo"
                value={customColors.background}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, background: t }))}
                colors={theme}
            />
            <ColorInput
                label="Cor dos Cartões"
                value={customColors.card}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, card: t }))}
                colors={theme}
            />
            <ColorInput
                label="Cor do Texto"
                value={customColors.text}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, text: t }))}
                colors={theme}
            />
            <ColorInput
                label="Texto Secundário"
                value={customColors.textSecondary}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, textSecondary: t }))}
                colors={theme}
            />
            <ColorInput
                label="Bordas"
                value={customColors.border}
                onChangeText={(t: string) => setCustomColors(c => ({ ...c, border: t }))}
                colors={theme}
            />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustom} disabled={loading}>
            {loading ? <ActivityIndicator color={customColors.card} /> : <Text style={styles.saveButtonText}>Salvar Tema Personalizado</Text>}
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Componentes Auxiliares ---

interface OptionProps {
    label: string; icon: any; isSelected: boolean; onPress: () => void; colors: ColorPalette;
}
const ThemeOption: React.FC<OptionProps> = ({ label, icon, isSelected, onPress, colors }) => {
    const styles = getItemStyles(colors);
    return (
      <TouchableOpacity style={[styles.itemContainer, isSelected && styles.itemSelected]} onPress={onPress}>
        <View style={styles.itemTextContainer}>
          <Feather name={icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
          <Text style={[styles.itemLabel, isSelected && { color: colors.primary, fontWeight: 'bold' }]}>{label}</Text>
        </View>
        {isSelected && <Feather name="check" size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
};

interface InputProps {
    label: string; value: string; onChangeText: (text: string) => void; colors: ColorPalette;
}
const ColorInput: React.FC<InputProps> = ({ label, value, onChangeText, colors }) => {
    const styles = getItemStyles(colors);
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.itemLabel}>{label}</Text>
        <View style={styles.inputWrapper}>
          <View style={[styles.colorPreview, { backgroundColor: value }]} />
          <TextInput 
            style={styles.input} 
            value={value} 
            onChangeText={onChangeText} 
            autoCapitalize="characters" 
            maxLength={7} 
            placeholder="#000000"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
    );
};

const getItemStyles = (c: ColorPalette) => StyleSheet.create({
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: c.border },
    itemSelected: { backgroundColor: c.primary + '10' },
    itemTextContainer: { flexDirection: 'row', alignItems: 'center' },
    itemLabel: { fontSize: 16, marginLeft: 12, color: c.text },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.border, borderRadius: 8, paddingLeft: 8, backgroundColor: c.card },
    colorPreview: { width: 24, height: 24, borderRadius: 4, borderWidth: 1, borderColor: c.border },
    input: { width: 90, padding: 10, fontSize: 14, color: c.text, fontWeight: '600' },
});