import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { AppThemeProvider } from '../contexts/AppThemeContext';
import { getActiveUser } from '../services/storageService';

export default function RootLayout() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const appState = useRef(AppState.currentState);

  const refresh = async () => {
    const user = (await getActiveUser()) ?? undefined;
    setUsername((prev) => (prev !== user ? user : prev));
  };

  useEffect(() => {
    refresh();

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