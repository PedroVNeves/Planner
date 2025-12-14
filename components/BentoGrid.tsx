import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface BentoGridProps {
    focusText: string;
    onPressFocus: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ focusText, onPressFocus }) => {
    const { theme } = useTheme();

    // Cores de segurança
    const primary = theme?.primary || '#6200EE';

    return (
        <View style={styles.container}>
            {/* Bloco Único: Foco do Dia */}
            <TouchableOpacity 
                style={[styles.focusBlock, { backgroundColor: primary }]} 
                onPress={onPressFocus}
                activeOpacity={0.9}
            >
                <View>
                    <Text style={styles.focusLabel}>🎯 FOCO DO DIA</Text>
                    <Text style={styles.focusTitle} numberOfLines={2}>
                        {focusText || "Toque para definir..."}
                    </Text>
                </View>
                <View style={styles.iconCircle}>
                    <Feather name="arrow-right" size={20} color={primary} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        marginBottom: 20 
    },
    focusBlock: {
        padding: 20,
        borderRadius: 20,
        minHeight: 120,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    focusLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    focusTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        maxWidth: 220,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }
});