import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ACTIVE_USER_KEY, LEGACY_USERNAME_KEY } from '../constants/storageKeys';
import { useAppTheme } from '../contexts/AppThemeContext';

export default function IndexGate() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);

  const { theme } = useAppTheme();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const activeUser =
          (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
          (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));

        setHasUser(Boolean(activeUser));
      } catch (error) {
        console.error('Błąd odczytu użytkownika', error);
        setHasUser(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.primary2} />
      </View>
    );
  }

  return <Redirect href={hasUser ? '/home' : '/setup'} />;
}