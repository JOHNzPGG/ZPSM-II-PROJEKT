import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ACTIVE_USER_KEY, LEGACY_USERNAME_KEY } from '../constants/storageKeys';
import { AppThemeProvider } from '../contexts/AppThemeContext';

export default function RootLayout() {
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const user =
        (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_USERNAME_KEY)) ??
        undefined;
      setUsername(user ?? undefined);
    };
    load();
  }, []);

  // Re-read username when it might change — expo-router fires this on every
  // navigation so we subscribe to storage changes via a simple interval fallback.
  // A cleaner approach uses a context/event bus, but this is sufficient for now.
  useEffect(() => {
    const id = setInterval(async () => {
      const user =
        (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_USERNAME_KEY)) ??
        undefined;
      setUsername(prev => {
        const next = user ?? undefined;
        return prev !== next ? next : prev; // only update if changed
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppThemeProvider username={username}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppThemeProvider>
  );
}
