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
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
  userProfileKey,
} from '../constants/storageKeys';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

// Setup do zarządzania nickiem użytkownika w lokalnej bazie 
export default function SetupScreen() {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, []);

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
        await AsyncStorage.setItem(profileKey, JSON.stringify({ nickname, createdAt: new Date().toISOString() }));
      }
      if (!existingConfigs) {
        await AsyncStorage.setItem(configsKey, JSON.stringify([]));
      }
      router.replace('/home');
    } catch (error) {
      Alert.alert('Błąd', 'Nie udało się zapisać pseudonimu.');
    }
  };

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.screen}>
      <View style={styles.bgPattern}>
        {Array.from({ length: 48 }).map((_, i) => (
          <View key={i} style={styles.bgDot} />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
          ]}
        >
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
            <View style={styles.logoOuter}>
              <LinearGradient
                colors={[theme.surfaceRaised, theme.card]}
                style={styles.logoInner}
              >
                <Text style={[styles.logoPC, { color: theme.primary2 }]}>PC</Text>
                <Text style={[styles.logoUA, { color: theme.textSecondary }]}>UA</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          <Text style={styles.title}>PC Upgrade Advisor</Text>
          <Text style={styles.subtitle}>
            Ustaw pseudonim — aplikacja zapisze Twoje{'\n'}konfiguracje lokalnie pod tą nazwą.
          </Text>

          <View style={styles.card}>
            <Text style={styles.inputLabel}>Pseudonim</Text>
            <View style={[styles.inputWrap, isFocused && { borderColor: theme.primary2 }]}>
              <TextInput
                style={styles.input}
                placeholder="Np. MasterRace99"
                placeholderTextColor={theme.muted}
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoCapitalize="none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {name.length > 0 && (
                <Text style={[styles.charCount, { color: name.length >= 18 ? theme.primary2 : theme.muted }]}>
                  {name.length}/20
                </Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[theme.primary2, theme.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>KONTYNUUJ</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.footnote}>
            Dane przechowywane wyłącznie lokalnie na urządzeniu.
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const isLight = theme.name === 'light';

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    bgPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 40,
      padding: 30,
      opacity: 0.25,
    },
    bgDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.muted,
      margin: 18,
    },
    keyboardView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    container: {
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    logoWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    glowRing: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.primary2,
      shadowColor: theme.primary2,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 30,
      elevation: 20,
    },
    logoOuter: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: theme.surfaceSunken,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.borderStrong,
    },
    logoInner: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.neuShadowLight,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    logoPC: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 1,
      lineHeight: 24,
    },
    logoUA: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 3,
      lineHeight: 14,
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 28,
      padding: 22,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: isLight ? 0.18 : 0.6,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 16,
    },
    inputLabel: {
      color: theme.textSecondary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceSunken,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.border,
      marginBottom: 16,
      paddingHorizontal: 16,
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: isLight ? 0.12 : 0.4,
      shadowRadius: 8,
    },
    input: {
      flex: 1,
      color: theme.text,
      fontSize: 17,
      fontWeight: '600',
      paddingVertical: 16,
    },
    charCount: {
      fontSize: 12,
      fontWeight: '600',
    },
    button: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 10,
    },
    buttonGradient: {
      paddingVertical: 17,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 14,
      letterSpacing: 2,
    },
    buttonArrow: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 18,
      fontWeight: '300',
    },
    footnote: {
      color: theme.muted,
      fontSize: 12,
      textAlign: 'center',
    },
  });
}
