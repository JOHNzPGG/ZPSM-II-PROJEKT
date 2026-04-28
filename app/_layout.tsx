import { Stack } from 'expo-router';
import { AppThemeProvider } from '../contexts/AppThemeContext';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AppThemeProvider>
  );
}