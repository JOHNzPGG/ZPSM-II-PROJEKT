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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DummyBottomNav, { NavKey } from '../components/DummyBottomNav';
import ComponentsScreen from './components-screen';
import ConfigsScreen from './configs-screen';
import CompareScreen from './compare-screen';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
} from '../constants/storageKeys';
import { AccentName, AppTheme, useAppTheme } from '../contexts/AppThemeContext';

// ─── Accent picker data ──────────────────────────────────────────────────────
const ACCENTS: { key: AccentName; color: string; label: string }[] = [
  { key: 'red',    color: '#E83040', label: 'Czerwony' },
  { key: 'blue',   color: '#3584E4', label: 'Niebieski' },
  { key: 'green',  color: '#2EC27E', label: 'Zielony' },
  { key: 'purple', color: '#9141AC', label: 'Fioletowy' },
  { key: 'orange', color: '#E8720C', label: 'Pomarańczowy' },
];

// ─── Quick action cards ──────────────────────────────────────────────────────
type CardDef = {
  title: string;
  desc: string;
  icon: string;
  iconLib: 'ion' | 'mci';
  accent: boolean;
  navTarget: NavKey | null; // null = dummy (Ulepszenia)
};

const CARDS: CardDef[] = [
  { title: 'Komponenty',   desc: 'CPU, GPU, RAM, dyski',     icon: 'chip',                  iconLib: 'mci', accent: false, navTarget: 'components' },
  { title: 'Konfiguracje', desc: 'Twoje zestawy',            icon: 'monitor-dashboard',     iconLib: 'mci', accent: true,  navTarget: 'configs'    },
  { title: 'Porównanie',   desc: 'Zestawiaj komponenty',     icon: 'git-compare-outline',   iconLib: 'ion', accent: false, navTarget: 'threed'     },
  { title: 'Ulepszenia',   desc: 'Propozycje modernizacji',  icon: 'rocket-outline',        iconLib: 'ion', accent: false, navTarget: null         },
];

export default function HomeScreen() {
  const [username, setUsername] = useState('użytkowniku');
  const [activeView, setActiveView] = useState<NavKey>('home');
  const [configsCount, setConfigsCount] = useState(0);
  const [navHidden, setNavHidden] = useState(false);

  const router = useRouter();
  const { theme, themeName, accentName, toggleTheme, setAccent } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const loadUser = async () => {
      const activeUser =
        (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));
      if (activeUser) {
        setUsername(activeUser);
        const rawConfigs = await AsyncStorage.getItem(userConfigsKey(activeUser));
        const parsed = rawConfigs ? JSON.parse(rawConfigs) : [];
        setConfigsCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    };
    loadUser();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  // Re-animate on tab change
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [activeView]);

  const handleLogout = () => {
    Alert.alert(
      'Zmień użytkownika',
      'Aktywny pseudonim zostanie odłączony od aplikacji. Konfiguracje zostaną zachowane.',
      [
        { text: 'Anuluj', style: 'cancel' },
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

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderHome = () => (
    <>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>Witaj z powrotem</Text>
            <Text style={styles.heroTitle}>{username}</Text>
          </View>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{username.slice(0, 1).toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge label="Zestawy" value={`${configsCount}/3`} theme={theme} styles={styles} />
          <StatBadge label="Status" value="Aktywny" theme={theme} styles={styles} accent />
          <StatBadge label="Motyw" value={themeName === 'dark' ? 'Ciemny' : 'Jasny'} theme={theme} styles={styles} />
        </View>
      </View>

      {/* Section */}
      <Text style={styles.sectionLabel}>SZYBKIE AKCJE</Text>

      <View style={styles.grid}>
        {CARDS.map((card, i) => (
          <ActionCard key={i} card={card} index={i} theme={theme} styles={styles} onNavigate={setActiveView} />
        ))}
      </View>

      {/* Bottom promo */}
      <Pressable onPress={() => setActiveView('configs')}>
      <View style={styles.promoCard}>
        <LinearGradient
          colors={[theme.primary2, theme.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoGradient}
        >
          <View style={styles.promoLeft}>
            <Text style={styles.promoTitle}>Sprawdź kompatybilność</Text>
            <Text style={styles.promoSub}>Upewnij się, że Twój zestaw gra razem.</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={36} color="rgba(255,255,255,0.8)" />
        </LinearGradient>
      </View>
      </Pressable>
    </>
  );

  const renderProfile = () => (
    <>
      {/* Profile header */}
      <View style={styles.profileHero}>
        <View style={styles.profileAvatarWrap}>
          <LinearGradient colors={[theme.primary2, theme.primary]} style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{username.slice(0, 1).toUpperCase()}</Text>
          </LinearGradient>
        </View>
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileSub}>Lokalny profil użytkownika</Text>
      </View>

      {/* Info card */}
      <View style={styles.infoCard}>
        <InfoRow label="Pseudonim" value={username} theme={theme} styles={styles} />
        <View style={styles.divider} />
        <InfoRow label="Konfiguracje" value={`${configsCount} / 3`} theme={theme} styles={styles} />
        <View style={styles.divider} />
        <InfoRow label="Motyw" value={themeName === 'dark' ? 'Ciemny' : 'Jasny'} theme={theme} styles={styles} />
      </View>

      {/* Accent picker */}
      <Text style={styles.sectionLabel}>KOLOR AKCENTU</Text>
      <View style={styles.accentRow}>
        {ACCENTS.map((a) => (
          <Pressable key={a.key} onPress={() => setAccent(a.key)} style={styles.accentWrap}>
            <View
              style={[
                styles.accentDot,
                { backgroundColor: a.color },
                accentName === a.key && styles.accentDotActive,
              ]}
            />
            {accentName === a.key && (
              <Text style={[styles.accentLabel, { color: theme.primary2 }]}>{a.label}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* Action buttons */}
      <Pressable
        style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
        onPress={toggleTheme}
      >
        <Ionicons name={themeName === 'dark' ? 'sunny-outline' : 'moon-outline'} size={18} color={theme.text} />
        <Text style={styles.secondaryBtnText}>
          {themeName === 'dark' ? 'Przełącz na jasny' : 'Przełącz na ciemny'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.dangerBtn, pressed && { opacity: 0.8 }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        <Text style={styles.dangerBtnText}>WYLOGUJ / ZMIEŃ UŻYTKOWNIKA</Text>
      </Pressable>
    </>
  );

  const renderPlaceholder = (title: string, desc: string, iconName: string) => (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIconWrap}>
        <Ionicons name={iconName as any} size={40} color={theme.primary2} />
      </View>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderDesc}>{desc}</Text>
      <View style={styles.placeholderBadge}>
        <Text style={styles.placeholderBadgeText}>Wkrótce</Text>
      </View>
    </View>
  );

  // Components tab renders its own full-screen scroll — bypass the shared ScrollView
  if (activeView === 'components') {
    return (
      <View style={styles.screen}>
        <ComponentsScreen />
        <DummyBottomNav active={activeView} onChange={setActiveView} />
      </View>
    );
  }

  // Compare tab — full screen
  if (activeView === 'threed') {
    return (
      <View style={styles.screen}>
        <CompareScreen />
        <DummyBottomNav active={activeView} onChange={setActiveView} />
      </View>
    );
  }

  // Configs tab — full screen with own scroll
  if (activeView === 'configs') {
    return (
      <View style={styles.screen}>
        <ConfigsScreen onConfiguratorOpen={setNavHidden} />
        <DummyBottomNav active={activeView} onChange={setActiveView} hidden={navHidden} />
      </View>
    );
  }

  const renderContent = () => {
    if (activeView === 'profile') return renderProfile();
    if (activeView === 'threed') return null; // handled below as full-screen
    return renderHome();
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {renderContent()}
        </Animated.View>
      </ScrollView>

      <DummyBottomNav active={activeView} onChange={setActiveView} />
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatBadge({
  label, value, theme, styles, accent = false,
}: {
  label: string; value: string; theme: AppTheme; styles: any; accent?: boolean;
}) {
  return (
    <View style={[styles.statBadge, accent && { borderColor: theme.primary2 }]}>
      <Text style={[styles.statValue, accent && { color: theme.primary2 }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionCard({
  card, index, theme, styles, onNavigate,
}: {
  card: CardDef; index: number; theme: AppTheme; styles: any;
  onNavigate: (key: NavKey) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isDummy = card.navTarget === null;

  const pressIn = () => !isDummy && Animated.spring(scale, { toValue: 0.96, friction: 6, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  return (
    <Pressable
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={() => card.navTarget && onNavigate(card.navTarget)}
      style={styles.cardPressable}
      disabled={isDummy}
    >
      <Animated.View style={[
        styles.actionCard,
        { transform: [{ scale }] },
        card.accent && { borderColor: theme.primary2 },
        isDummy && { opacity: 0.45 },
      ]}>
        <View style={[styles.cardIconWrap, card.accent && { backgroundColor: theme.primary2 }]}>
          {card.iconLib === 'mci'
            ? <MaterialCommunityIcons name={card.icon as any} size={22} color={card.accent ? '#fff' : theme.primary2} />
            : <Ionicons name={card.icon as any} size={22} color={card.accent ? '#fff' : theme.primary2} />
          }
        </View>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDesc}>{card.desc}</Text>
        {isDummy && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Wkrótce</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

function InfoRow({ label, value, theme, styles }: { label: string; value: string; theme: AppTheme; styles: any }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: AppTheme) {
  const isLight = theme.name === 'light';
  const neuElevation = {
    shadowColor: theme.neuShadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: isLight ? 0.16 : 0.55,
    shadowRadius: 14,
    elevation: 8,
  };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      paddingTop: 56,
      paddingHorizontal: 18,
      paddingBottom: 120,
    },

    // ── Hero ────────────────────────────────────────────────────────────────
    hero: {
      backgroundColor: theme.card,
      borderRadius: 28,
      padding: 22,
      marginBottom: 26,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neuElevation,
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    heroEyebrow: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    heroAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primary2,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
    heroAvatarText: {
      color: '#FFF',
      fontSize: 20,
      fontWeight: '900',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    statBadge: {
      flex: 1,
      backgroundColor: theme.surfaceSunken,
      borderRadius: 16,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    statValue: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '900',
      marginBottom: 2,
    },
    statLabel: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },

    // ── Section label ────────────────────────────────────────────────────────
    sectionLabel: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      marginBottom: 14,
    },

    // ── Action cards grid ────────────────────────────────────────────────────
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    cardPressable: {
      width: '47.5%',
    },
    actionCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 16,
      minHeight: 130,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neuElevation,
    },
    cardIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.surfaceSunken,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 4,
    },
    cardDesc: {
      color: theme.muted,
      fontSize: 12,
      lineHeight: 17,
    },
    comingSoonBadge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      backgroundColor: theme.surfaceSunken,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: theme.borderStrong,
    },
    comingSoonText: {
      color: theme.muted,
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    // ── Promo card ───────────────────────────────────────────────────────────
    promoCard: {
      borderRadius: 22,
      overflow: 'hidden',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
      marginBottom: 8,
    },
    promoGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 22,
    },
    promoLeft: {
      flex: 1,
      marginRight: 12,
    },
    promoTitle: {
      color: '#FFF',
      fontSize: 17,
      fontWeight: '900',
      marginBottom: 4,
    },
    promoSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 13,
    },

    // ── Profile ──────────────────────────────────────────────────────────────
    profileHero: {
      alignItems: 'center',
      paddingVertical: 28,
      marginBottom: 20,
    },
    profileAvatarWrap: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme.surfaceSunken,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
      ...neuElevation,
      borderWidth: 2,
      borderColor: theme.borderStrong,
    },
    profileAvatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileAvatarText: {
      color: '#FFF',
      fontSize: 32,
      fontWeight: '900',
    },
    profileName: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '900',
      marginBottom: 4,
    },
    profileSub: {
      color: theme.muted,
      fontSize: 13,
    },
    infoCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      marginBottom: 26,
      ...neuElevation,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    infoLabel: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '600',
    },
    infoValue: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 16,
    },
    accentRow: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 24,
      alignItems: 'center',
    },
    accentWrap: {
      alignItems: 'center',
      gap: 6,
    },
    accentDot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    accentDotActive: {
      borderColor: theme.text,
      transform: [{ scale: 1.15 }],
    },
    accentLabel: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    secondaryBtn: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neuElevation,
    },
    secondaryBtnText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 14,
    },
    dangerBtn: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
    dangerBtnText: {
      color: '#FFF',
      fontWeight: '900',
      fontSize: 13,
      letterSpacing: 1,
    },

    // ── Placeholder ──────────────────────────────────────────────────────────
    placeholder: {
      backgroundColor: theme.card,
      borderRadius: 28,
      padding: 32,
      minHeight: 300,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neuElevation,
    },
    placeholderIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surfaceSunken,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.borderStrong,
    },
    placeholderTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 10,
      textAlign: 'center',
    },
    placeholderDesc: {
      color: theme.muted,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 22,
    },
    placeholderBadge: {
      backgroundColor: theme.surfaceSunken,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: theme.borderStrong,
    },
    placeholderBadgeText: {
      color: theme.primary2,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
    },
  });
}
