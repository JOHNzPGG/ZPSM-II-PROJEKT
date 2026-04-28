import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await AsyncStorage.getItem('username');
    if (user) setHasUser(true);
    setIsReady(true);
  };

  useEffect(() => {
    if (!isReady) return;

    const inTabs = segments === '(tabs)';

    if (!hasUser && inTabs) {
      // Jeśli nie ma usera, a jesteśmy w tabsach -> wywal do setupu
      router.replace('/setup');
    } else if (hasUser && !inTabs) {
      // Jeśli jest user, a nie jesteśmy w tabsach -> wrzuć do aplikacji
      router.replace('/(tabs)');
    }
  }, [hasUser, isReady, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}