import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona automaticamente para a rota das abas (Dashboard)
  return <Redirect href="/(tabs)/dashboard" />;
}