import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DummyBottomNav, { NavKey } from '../components/DummyBottomNav';

import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
} from '../constants/storageKeys';

import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

export default function HomeScreen() {
  const [username, setUsername] = useState('użytkowniku');
  const [activeView, setActiveView] = useState<NavKey>('home');
  const [configsCount, setConfigsCount] = useState(0);

  const router = useRouter();
  const { theme, themeName, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const loadUser = async () => {
      const activeUser =
        (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));

      if (activeUser) {
        setUsername(activeUser);

        const rawConfigs = await AsyncStorage.getItem(userConfigsKey(activeUser));
        const parsedConfigs = rawConfigs ? JSON.parse(rawConfigs) : [];
        setConfigsCount(Array.isArray(parsedConfigs) ? parsedConfigs.length : 0);
      }
    };

    loadUser();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogout = () => {
    Alert.alert(
      'Zmień użytkownika',
      'Aktywny pseudonim zostanie odłączony od aplikacji. Konfiguracje zostaną zachowane pod nazwą tego użytkownika.',
      [
        {
          text: 'Anuluj',
          style: 'cancel',
        },
        {
          text: 'Wyloguj',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([ACTIVE_USER_KEY, LEGACY_USERNAME_KEY]);
            router.replace('/setup');
          },
        },
      ],
    );
  };

  const renderHome = () => (
    <>
      <LinearGradient
        colors={[theme.primary2, theme.primary]}
        style={styles.heroCard}
      >
        <Text style={styles.heroEyebrow}>PC Upgrade Advisor</Text>
        <Text style={styles.heroTitle}>Cześć, {username}!</Text>
        <Text style={styles.heroSubtitle}>
          Zarządzaj zestawami, sprawdzaj kompatybilność i planuj modernizację komputera.
        </Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Szybkie akcje</Text>

      <View style={styles.cardGrid}>
        <DashboardCard
          title="Komponenty"
          text="Przeglądaj CPU, GPU, RAM i dyski z bazy."
          emoji="🧩"
          styles={styles}
        />
        <DashboardCard
          title="Konfiguracje"
          text={`Zapisane zestawy: ${configsCount}/3.`}
          emoji="🖥️"
          styles={styles}
        />
        <DashboardCard
          title="Kompatybilność"
          text="Sprawdź zgodność elementów zestawu."
          emoji="✅"
          styles={styles}
        />
        <DashboardCard
          title="Ulepszenia"
          text="Zobacz przyszłe sugestie rozbudowy."
          emoji="🚀"
          styles={styles}
        />
      </View>
    </>
  );

  const renderProfile = () => (
    <>
      <LinearGradient
        colors={[theme.black, theme.background]}
        style={styles.profileHeader}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {username.slice(0, 1).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileSubtitle}>
          Lokalny profil użytkownika
        </Text>
      </LinearGradient>

      <View style={styles.profileCard}>
        <Text style={styles.profileCardTitle}>Dane profilu</Text>
        <Text style={styles.profileLine}>Pseudonim: {username}</Text>
        <Text style={styles.profileLine}>Konfiguracje: {configsCount}/3</Text>
        <Text style={styles.profileLine}>
          Motyw: {themeName === 'dark' ? 'ciemny' : 'jasny'}
        </Text>
      </View>

      <Pressable style={styles.secondaryButton} onPress={toggleTheme}>
        <Text style={styles.secondaryButtonText}>ZMIEŃ MOTYW</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>WYLOGUJ / ZMIEŃ UŻYTKOWNIKA</Text>
      </Pressable>
    </>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <View style={styles.placeholderCard}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>{description}</Text>
      <Text style={styles.placeholderBadge}>Widok roboczy</Text>
    </View>
  );

  const renderContent = () => {
    if (activeView === 'profile') return renderProfile();

    if (activeView === 'components') {
      return renderPlaceholder(
        'Komponenty',
        'Tutaj później pojawi się lista CPU, GPU, RAM i dysków z filtrowaniem.',
      );
    }

    if (activeView === 'configs') {
      return renderPlaceholder(
        'Konfiguracje',
        'Tutaj później pojawi się menedżer maksymalnie 3 zestawów użytkownika.',
      );
    }

    if (activeView === 'threed') {
      return renderPlaceholder(
        'Widok 3D',
        'Tutaj można później dodać wizualizację zestawu albo ekran porównawczy.',
      );
    }

    return renderHome();
  };

  return (
    <LinearGradient
      colors={[theme.background, theme.background2]}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {renderContent()}
        </Animated.View>
      </ScrollView>

      <DummyBottomNav active={activeView} onChange={setActiveView} />
    </LinearGradient>
  );
}

function DashboardCard({
  title,
  text,
  emoji,
  styles,
}: {
  title: string;
  text: string;
  emoji: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.dashboardCard}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.dashboardCardTitle}>{title}</Text>
      <Text style={styles.dashboardCardText}>{text}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 64,
      paddingHorizontal: 18,
      paddingBottom: 130,
    },
    heroCard: {
      borderRadius: 30,
      padding: 24,
      marginBottom: 26,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 9,
    },
    heroEyebrow: {
      color: 'rgba(255,255,255,0.78)',
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
    },
    heroTitle: {
      color: theme.white,
      fontSize: 30,
      fontWeight: '900',
      marginBottom: 10,
    },
    heroSubtitle: {
      color: 'rgba(255,255,255,0.86)',
      fontSize: 15,
      lineHeight: 22,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 21,
      fontWeight: '900',
      marginBottom: 16,
    },
    cardGrid: {
      gap: 14,
    },
    dashboardCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 18,
      minHeight: 120,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 5,
    },
    cardEmoji: {
      fontSize: 26,
      marginBottom: 10,
    },
    dashboardCardTitle: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.textDark,
      marginBottom: 8,
    },
    dashboardCardText: {
      fontSize: 14,
      color: theme.muted,
      lineHeight: 21,
    },
    profileHeader: {
      borderRadius: 30,
      padding: 26,
      alignItems: 'center',
      marginBottom: 18,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 8,
    },
    avatar: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: theme.primary,
      borderWidth: 3,
      borderColor: theme.white,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    avatarText: {
      color: theme.white,
      fontSize: 34,
      fontWeight: '900',
    },
    profileName: {
      color: theme.white,
      fontSize: 26,
      fontWeight: '900',
    },
    profileSubtitle: {
      color: 'rgba(255,255,255,0.74)',
      marginTop: 6,
      fontSize: 14,
    },
    profileCard: {
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 14,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 14,
      elevation: 4,
    },
    profileCardTitle: {
      color: theme.textDark,
      fontSize: 19,
      fontWeight: '900',
      marginBottom: 12,
    },
    profileLine: {
      color: theme.muted,
      fontSize: 15,
      marginBottom: 8,
    },
    secondaryButton: {
      backgroundColor: theme.card,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: theme.textDark,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    logoutButton: {
      backgroundColor: theme.primary,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 14,
      elevation: 5,
    },
    logoutButtonText: {
      color: theme.white,
      fontWeight: '900',
      letterSpacing: 0.4,
    },
    placeholderCard: {
      backgroundColor: theme.card,
      borderRadius: 28,
      padding: 24,
      minHeight: 260,
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.14,
      shadowRadius: 18,
      elevation: 6,
    },
    placeholderTitle: {
      color: theme.textDark,
      fontSize: 26,
      fontWeight: '900',
      marginBottom: 10,
    },
    placeholderText: {
      color: theme.muted,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 18,
    },
    placeholderBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.primary,
      color: theme.white,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
      fontSize: 12,
      fontWeight: '900',
      overflow: 'hidden',
    },
  });
}