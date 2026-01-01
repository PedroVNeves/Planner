
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface StreakRecoveryModalProps {
  visible: boolean;
  onUseFreeze: () => void;
  onReset: () => void;
  livesRemaining: number;
}

const StreakRecoveryModal: React.FC<StreakRecoveryModalProps> = ({ visible, onUseFreeze, onReset, livesRemaining }) => {
  const { theme } = useTheme();

  if (!visible) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.75)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 32,
      width: Dimensions.get('window').width * 0.85,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    iconContainer: {
      marginBottom: 20,
      backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue tint
      padding: 20,
      borderRadius: 50,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        gap: 12
    },
    freezeButton: {
      backgroundColor: '#3B82F6', // Blue color for freeze
      paddingVertical: 16,
      borderRadius: 16,
      width: '100%',
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    freezeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    resetButton: {
      paddingVertical: 16,
      borderRadius: 16,
      width: '100%',
      alignItems: 'center',
    },
    resetButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
    livesBadge: {
        marginTop: 4,
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)'
    }
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Feather name="thermometer" size={48} color="#3B82F6" />
          </View>
          
          <Text style={styles.title}>Ofensiva Congelada!</Text>
          <Text style={styles.description}>
            Você esqueceu de praticar ontem. Quer usar um congelamento para manter sua ofensiva intacta?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.freezeButton} onPress={onUseFreeze}>
                <View style={{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Feather name="snowflake" size={20} color="#fff" />
                        <Text style={styles.freezeButtonText}>Usar Congelamento</Text>
                    </View>
                    <Text style={styles.livesBadge}>Restam: {livesRemaining}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                <Text style={styles.resetButtonText}>Não, zerar ofensiva</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StreakRecoveryModal;
