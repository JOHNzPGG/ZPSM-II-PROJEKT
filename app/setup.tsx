import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
  userProfileKey,
} from '../constants/storageKeys';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

export default function SetupScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { theme } = useAppTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateAnim]);

  const handleSave = async () => {
    const nickname = name.trim();

    if (nickname.length < 3) {
      Alert.alert('Błąd', 'Pseudonim musi mieć co najmniej 3 znaki.');
      return;
    }

    try {
      await AsyncStorage.multiSet([
        [ACTIVE_USER_KEY, nickname],
        [LEGACY_USERNAME_KEY, nickname],
      ]);

      const profileKey = userProfileKey(nickname);
      const configsKey = userConfigsKey(nickname);

      const existingProfile = await AsyncStorage.getItem(profileKey);
      const existingConfigs = await AsyncStorage.getItem(configsKey);

      if (!existingProfile) {
        await AsyncStorage.setItem(
          profileKey,
          JSON.stringify({
            nickname,
            createdAt: new Date().toISOString(),
          }),
        );
      }

      if (!existingConfigs) {
        await AsyncStorage.setItem(configsKey, JSON.stringify([]));
      }

      router.replace('/home');
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Nie udało się zapisać pseudonimu.');
    }
  };

  return (
    <LinearGradient
      colors={[theme.background, theme.background2]}
      style={styles.screen}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>PC</Text>
          </View>

          <Text style={styles.title}>PC Upgrade Advisor</Text>

          <Text style={styles.subtitle}>
            Ustaw pseudonim, a aplikacja będzie zapisywać Twoje konfiguracje lokalnie pod tą nazwą.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Np. MasterRace99"
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            activeOpacity={0.86}
          >
            <LinearGradient
              colors={[theme.primary2, theme.primary]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>ZAPISZ I KONTYNUUJ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 430,
      padding: 26,
      borderRadius: 30,
      backgroundColor: theme.glass,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.22,
      shadowRadius: 30,
      elevation: 10,
    },
    logoCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: theme.black,
      borderWidth: 3,
      borderColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 18,
    },
    logoText: {
      color: theme.white,
      fontSize: 24,
      fontWeight: '900',
    },
    title: {
      color: theme.text,
      fontSize: 31,
      fontWeight: '900',
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      color: theme.muted,
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    input: {
      backgroundColor: theme.card,
      color: theme.textDark,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 18,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 18,
    },
    button: {
      borderRadius: 18,
      overflow: 'hidden',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 8,
    },
    buttonGradient: {
      paddingVertical: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.white,
      fontWeight: '900',
      fontSize: 15,
      letterSpacing: 0.6,
    },
  });
}