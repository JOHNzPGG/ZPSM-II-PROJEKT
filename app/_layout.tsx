import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from './constants/globalStyles';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  const segments = useSegments();
  const router = useRouter();

  const loadUser = async () => {
    try {
      const savedName = await AsyncStorage.getItem('username');
      setUsername(savedName);
    } catch (e) {
      console.error('Błąd odczytu danych', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const inSetupScreen = currentSegment === 'setup';

    if (!username && !inSetupScreen) {
      router.replace('/setup');
    } else if (username && inSetupScreen) {
      router.replace('/(tabs)');
    }
  }, [username, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}