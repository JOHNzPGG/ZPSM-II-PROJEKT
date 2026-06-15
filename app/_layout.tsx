import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ACTIVE_USER_KEY, LEGACY_USERNAME_KEY } from '../constants/storageKeys';
import { AppThemeProvider } from '../contexts/AppThemeContext';

async function readActiveUser(): Promise<string | undefined> {
  const user =
    (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
    (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));
  return user ?? undefined;
}

export default function RootLayout() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const appState = useRef(AppState.currentState);

  const refresh = async () => {
    const user = await readActiveUser();
    setUsername((prev) => (prev !== user ? user : prev));
  };

  useEffect(() => {
    // Initial load
    refresh();

    // Re-check when app comes back to foreground (e.g. after settings change)
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        refresh();
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);

  return (
    <AppThemeProvider username={username}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppThemeProvider>
  );
}