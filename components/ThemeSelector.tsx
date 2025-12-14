import React from 'react';
import { ScrollView, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme, themes, ThemeType } from '../theme';

const themeList: { id: ThemeType; name: string }[] = [
    { id: 'ocean', name: 'Ocean Focus' },
    { id: 'forest', name: 'Forest Zen' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'coffee', name: 'Coffee' },
];

const customColors = ['#FF5733', '#C70039', '#900C3F', '#FFC300', '#DAF7A6', '#33C1FF'];

export const ThemeSelector = () => {
    const { theme, themeName, setTheme, setCustomTheme } = useTheme();
    const router = useRouter();

    const handleSelectTheme = (id: ThemeType) => {
        // 1. Aplica o tema
        setTheme(id);
        // 2. Volta para a Home para ver o resultado
        router.push('/(tabs)/dashboard'); 
    };

    const handleSelectCustomColor = (color: string) => {
        // 1. Aplica a cor personalizada
        setCustomTheme(color);
        // 2. Volta para a Home
        router.push('/(tabs)/dashboard'); 
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>Temas & Cores</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. Temas Prontos (Cards) */}
                {themeList.map((item) => {
                    const itemTheme = themes[item.id];
                    const isActive = themeName === item.id;
                    
                    return (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => handleSelectTheme(item.id)}
                            activeOpacity={0.7}
                            style={[
                                styles.card, 
                                { 
                                    backgroundColor: itemTheme.card, 
                                    borderColor: isActive ? theme.accent : itemTheme.border, 
                                    borderWidth: isActive ? 3 : 1 
                                }
                            ]}
                        >
                            <View style={styles.previewContainer}>
                                <View style={[styles.colorDot, { backgroundColor: itemTheme.primary }]} />
                                <View style={[styles.colorDot, { backgroundColor: itemTheme.background }]} />
                            </View>
                            <Text style={[styles.themeName, { color: itemTheme.text }]}>{item.name}</Text>
                            
                            {isActive && (
                                <View style={styles.checkBadge}>
                                    <Feather name="check" size={12} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Divisor Visual */}
                <View style={{ width: 1, backgroundColor: theme.border, marginHorizontal: 16, height: '50%', alignSelf: 'center' }} />

                {/* 2. Cores Personalizadas (Bolinhas) */}
                {customColors.map((color) => {
                    const isSelected = themeName === 'custom' && theme.primary === color;
                    
                    return (
                        <TouchableOpacity
                            key={color}
                            onPress={() => handleSelectCustomColor(color)}
                            activeOpacity={0.8}
                            style={[
                                styles.circleButton,
                                { 
                                    backgroundColor: color, 
                                    borderWidth: isSelected ? 3 : 0, 
                                    borderColor: theme.text,
                                    transform: [{ scale: isSelected ? 1.1 : 1 }]
                                }
                            ]}
                        >
                             {isSelected && <Feather name="check" size={16} color="#FFF" />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 16 },
    scrollContent: { paddingHorizontal: 16, alignItems: 'center', paddingBottom: 10 },
    card: { width: 110, height: 90, borderRadius: 12, padding: 10, marginRight: 12, justifyContent: 'space-between', position: 'relative' },
    previewContainer: { flexDirection: 'row', gap: 6 },
    colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    themeName: { fontSize: 13, fontWeight: '600' },
    circleButton: { width: 40, height: 40, borderRadius: 20, marginRight: 10, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, elevation: 2 },
    checkBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#4CAF50', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' }
});