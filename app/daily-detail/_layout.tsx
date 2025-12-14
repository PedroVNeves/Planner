import { Stack } from 'expo-router';
import { useTheme } from '../../theme';

export default function DailyDetailLayout() {
  const { theme } = useTheme();
  
  // Cores de segurança
  const headerBg = theme?.background || '#ffffff';
  const headerText = theme?.text || '#000000';

  return (
    <Stack
      screenOptions={{
        // Estilo do cabeçalho baseado no tema
        headerStyle: {
          backgroundColor: headerBg,
        },
        headerTintColor: headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false, // Remove a linha/sombra padrão do header para ficar mais limpo
      }}
    >
      {/* Configuração da tela dinâmica [date] */}
      <Stack.Screen 
        name="[date]" 
        options={{ 
          title: 'Detalhes do Dia',
          headerBackTitle: 'Voltar' // Texto do botão de voltar (iOS)
        }} 
      />
    </Stack>
  );
}