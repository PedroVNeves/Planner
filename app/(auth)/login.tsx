
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

const LoginScreen = () => {
  useEffect(() => {
    // Since there is no login, we just navigate to the main app.
    router.replace('/(tabs)');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoginScreen;
