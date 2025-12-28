import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface MetricInputProps {
    metricId: string;
    name: string;
    unit: string;
    currentValue: number;
    target: number;
    onAdd: (amount: number) => void;
}

export const MetricInput: React.FC<MetricInputProps> = ({ metricId, name, unit, currentValue, target, onAdd }) => {
    const { theme } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const [value, setValue] = useState('');

    const handleAdd = () => {
        const amount = parseFloat(value);
        if (!isNaN(amount) && amount >= 0) {
            onAdd(amount);
            setValue('');
            setIsExpanded(false);
        }
    };

    // Cores de segurança para evitar crash
    const textColor = theme?.text || '#000';
    const textSec = theme?.textSecondary || '#666';
    const primary = theme?.primary || 'blue';
    const cardBg = theme?.background || '#fff';
    const borderColor = theme?.border || '#eee';

    // Lógica para não mostrar "/ 0" se não tiver meta definida
    const displayValue = target && target > 0 
        ? `${currentValue} / ${target} ${unit}`
        : `${currentValue} ${unit}`;

    return (
        <View style={{ marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.7}>
                <Text style={{ fontSize: 16, color: textSec, lineHeight: 24 }}>
                    {name}: <Text style={{ fontWeight: 'bold', color: primary }}>{displayValue}</Text>
                </Text>
            </TouchableOpacity>

            {isExpanded && (
                <View style={[styles.inputContainer, { backgroundColor: cardBg, borderColor: borderColor }]}>
                    <TextInput 
                        style={[styles.input, { color: textColor }]}
                        placeholder={`Definir (${unit})`}
                        placeholderTextColor={textSec}
                        keyboardType="numeric"
                        value={value}
                        onChangeText={setValue}
                        autoFocus
                        onSubmitEditing={handleAdd}
                    />
                    <TouchableOpacity style={[styles.addButton, { backgroundColor: primary }]} onPress={handleAdd}>
                        <Feather name="plus" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
        padding: 4,
    },
    input: {
        flex: 1,
        padding: 8,
        fontSize: 16,
    },
    addButton: {
        padding: 10,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    }
});