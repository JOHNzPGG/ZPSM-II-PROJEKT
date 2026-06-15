import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DummyBottomNav, { NavKey } from '../components/DummyBottomNav';
import CustomAlert, { AlertConfig } from '../components/CustomAlert';
import ComponentsScreen from './components-screen';
import ConfigsScreen, { Build } from './configs-screen';
import CompareScreen from './compare-screen';
import UpgradesScreen from './upgrades-screen';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userAvatarKey,
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
  { title: 'Ulepszenia',   desc: 'Propozycje modernizacji',  icon: 'rocket-outline',        iconLib: 'ion', accent: false, navTarget: 'upgrades' as NavKey },
];

export default function HomeScreen() {
  const [username, setUsername] = useState('użytkowniku');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<NavKey>('home');
  const [configsCount, setConfigsCount] = useState(0);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [navHidden, setNavHidden] = useState(false);
  const [customAlert, setCustomAlert] = useState<AlertConfig | null>(null);

  // Android back button handling
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // If on any tab other than home — go back to home
      if (activeView !== 'home') {
        setActiveView('home');
        setNavHidden(false);
        return true; // consumed
      }
      // On home tab — exit app
      return false;
    });
    return () => sub.remove();
  }, [activeView]);
  const [dailyTip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

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
        const savedAvatar = await AsyncStorage.getItem(userAvatarKey(activeUser));
        if (savedAvatar) setAvatarUri(savedAvatar);
        const rawConfigs = await AsyncStorage.getItem(userConfigsKey(activeUser));
        const parsed = rawConfigs ? JSON.parse(rawConfigs) : [];
        const parsedBuilds: Build[] = Array.isArray(parsed) ? parsed : [];
        setConfigsCount(parsedBuilds.length);
        setBuilds(parsedBuilds);
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

  const pickAvatar = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setCustomAlert({
          title: 'Brak uprawnień',
          message: 'Zezwól aplikacji na dostęp do galerii zdjęć w ustawieniach systemowych.',
          buttons: [{ text: 'OK', onPress: () => setCustomAlert(null) }],
        });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? 'Images',
        allowsEditing: true,
        aspect: [1, 1] as [number, number],
        quality: 0.6,
        base64: false,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        if (username) {
          await AsyncStorage.setItem(userAvatarKey(username), uri);
        }
      }
    } catch (e) {
      console.error('Image picker error:', e);
      setCustomAlert({
        title: 'Błąd galerii',
        message: 'Upewnij się że expo-image-picker jest zainstalowany: npx expo install expo-image-picker',
        buttons: [{ text: 'OK', onPress: () => setCustomAlert(null) }],
      });
    }
  };

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
      {/* Hero card */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.heroEyebrow}>Witaj z powrotem</Text>
            <Text style={styles.heroTitle}>{username}</Text>
            {/* Daily tip */}
            <View style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={13} color={theme.primary2} />
              <Text style={styles.tipText}>{dailyTip}</Text>
            </View>
          </View>
          <Pressable style={styles.heroAvatar} onPress={pickAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.heroAvatarImage} />
            ) : (
              <Text style={styles.heroAvatarText}>{username.slice(0, 1).toUpperCase()}</Text>
            )}
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatBadge label="Zestawy" value={`${configsCount}/3`} theme={theme} styles={styles} />
          <StatBadge label="Status" value="Aktywny" theme={theme} styles={styles} accent />
          <StatBadge label="Motyw" value={themeName === 'dark' ? 'Ciemny' : 'Jasny'} theme={theme} styles={styles} />
        </View>
      </View>

      {/* Builds section */}
      <Text style={styles.sectionLabel}>TWOJE ZESTAWY</Text>
      <BuildsCarousel
        builds={builds}
        theme={theme}
        styles={styles}
        onNavigate={setActiveView}
      />

      {/* Section */}
      <Text style={styles.sectionLabel}>SZYBKIE AKCJE</Text>
      <View style={styles.grid}>
        {CARDS.map((card, i) => (
          <ActionCard key={i} card={card} index={i} theme={theme} styles={styles} onNavigate={setActiveView} />
        ))}
      </View>
    </>
  );

  const renderProfile = () => (
    <>
      {/* Profile header */}
      <View style={styles.profileHero}>
        <Pressable style={styles.profileAvatarWrap} onPress={pickAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.profileAvatarImg} />
          ) : (
            <LinearGradient colors={[theme.primary2, theme.primary]} style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{username.slice(0, 1).toUpperCase()}</Text>
            </LinearGradient>
          )}
          {/* Edit badge */}
          <View style={styles.profileAvatarEdit}>
            <Ionicons name="camera" size={12} color="#fff" />
          </View>
        </Pressable>
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileSub}>Dotknij zdjęcie aby zmienić</Text>
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

  // Upgrades tab — full screen
  if (activeView === ('upgrades' as any)) {
    return (
      <View style={styles.screen}>
        <UpgradesScreen />
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


// ─── Tips data ────────────────────────────────────────────────────────────────

const TIPS: string[] = [
  'Komputer IBM PC z 1981 roku kosztował ~$1500 — dziś to odpowiednik ~$5000.',
  'Nowe karty graficzne tanieją średnio o 20-30% w ciągu roku od premiery.',
  'W 2023 roku na świecie wydano ponad 11 000 gier na PC.',
  'Przeciętny gracz PC wydaje ok. $500 rocznie na gry i subskrypcje.',
  'Tylko ~20% graczy decyduje się na samodzielne złożenie komputera.',
  'Pierwszy 1 GB dysk twardy z 1980 roku ważył 250 kg i kosztował $40 000.',
  'DDR5 jest 2× szybsze od DDR4, ale różnicę w grach rzadko przekracza 5%.',
  'Litografia 3 nm oznacza tranzystory mniejsze niż DNA — ok. 2,5 nm szerokości.',
  'Intel wprowadził wielordzeniowe CPU dla konsumentów dopiero w 2005 roku.',
  'Pierwsza karta graficzna NVIDIA GeForce (1999) miała 32 MB pamięci VRAM.',
  'PCIe 5.0 SSD jest 2× szybszy od PCIe 4.0, ale różnicę czuć tylko przy dużych plikach.',
  'Ryzen serii X3D używa 3D V-Cache — kości pamięci dosłownie przyklejone do CPU.',
  'Średnia żywotność dysku HDD to ok. 3-5 lat, SSD — 5-10 lat.',
  'Pierwsza wersja Windowsa (1.0) miała zaledwie 256 KB wymagań RAM.',
  'Co sekundę na świecie sprzedaje się ok. 4 nowe smartfony i 1 nowy laptop.',
];

// ─── Builds Carousel ──────────────────────────────────────────────────────────

const SCREEN_W = Dimensions.get('window').width;
const CARD_W   = SCREEN_W - 36 - 32; // padding 18 each side, inner padding 16 each

function BuildsCarousel({
  builds, theme, styles, onNavigate,
}: {
  builds: Build[];
  theme: AppTheme;
  styles: any;
  onNavigate: (key: NavKey) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (builds.length === 0) {
    // Empty state — call to action
    return (
      <Pressable
        style={({ pressed }) => [styles.emptyBuildCard, pressed && { opacity: 0.85 }]}
        onPress={() => onNavigate('configs')}
      >
        <View style={styles.emptyBuildIcon}>
          <Ionicons name="add-circle-outline" size={36} color={theme.primary2} />
        </View>
        <Text style={styles.emptyBuildTitle}>Brak zestawów</Text>
        <Text style={styles.emptyBuildDesc}>
          Dotknij aby złożyć swój pierwszy zestaw komputerowy.
        </Text>
        <View style={styles.emptyBuildBtn}>
          <Text style={styles.emptyBuildBtnText}>Utwórz zestaw →</Text>
        </View>
      </Pressable>
    );
  }

  const totalPrice = (b: Build) =>
    Object.values(b.slots).reduce((s, comp) => s + (comp?.price ?? 0), 0);
  const filledCount = (b: Build) => Object.keys(b.slots).length;

  return (
    <View style={{ marginBottom: 24 }}>
      <FlatList
        data={builds}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 12, paddingHorizontal: 0 }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + 12));
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item: build }) => {
          const filled = filledCount(build);
          const price  = totalPrice(build);
          const pct    = filled / 8;

          return (
            <Pressable
              style={({ pressed }) => [
                styles.buildSwipeCard,
                { width: CARD_W },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => onNavigate('configs')}
            >
              {/* Top row */}
              <View style={styles.buildCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.buildCardName} numberOfLines={1}>{build.name}</Text>
                  <Text style={styles.buildCardDate}>
                    {new Date(build.createdAt).toLocaleDateString('pl-PL')}
                  </Text>
                </View>
                <View style={styles.buildCardPricePill}>
                  <Text style={styles.buildCardPrice}>
                    {price > 0 ? `${price.toLocaleString('pl-PL')} zł` : '— zł'}
                  </Text>
                </View>
              </View>

              {/* Slot pills */}
              <View style={styles.buildSlotRow}>
                {(['cpu','gpu','ram','motherboard','cooler','psu','ssd','case'] as const).map((slot) => {
                  const comp = (build.slots as any)[slot];
                  return (
                    <View
                      key={slot}
                      style={[
                        styles.buildSlotDot,
                        comp ? { backgroundColor: theme.primary2 } : { backgroundColor: theme.surfaceSunken },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Progress bar */}
              <View style={styles.buildProgressBg}>
                <Animated.View style={[styles.buildProgressFill, { width: `${pct * 100}%` }]} />
              </View>
              <Text style={styles.buildProgressLabel}>{filled} / 8 slotów · Dotknij aby otworzyć</Text>
            </Pressable>
          );
        }}
      />

      {/* Dot indicators — only if more than 1 build */}
      {builds.length > 1 && (
        <View style={styles.dotsRow}>
          {builds.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && { backgroundColor: theme.primary2, width: 16 },
              ]}
            />
          ))}
        </View>
      )}
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
        (card.navTarget === null) && { opacity: 0.45 },
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

    // ── Tip ─────────────────────────────────────────────────────────────────
    tipRow: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: 6,
      marginTop: 8,
    },
    tipText: {
      color: theme.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      flex: 1,
      fontStyle: 'italic' as const,
    },

    // ── Build carousel ───────────────────────────────────────────────────────
    emptyBuildCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 24,
      borderWidth: 1.5,
      borderColor: theme.primary2,
      borderStyle: 'dashed' as const,
      alignItems: 'center' as const,
      marginBottom: 24,
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: isLight ? 0.13 : 0.5,
      shadowRadius: 12,
      elevation: 6,
    },
    emptyBuildIcon: {
      width: 64, height: 64, borderRadius: 32,
      backgroundColor: theme.surfaceSunken,
      borderWidth: 1, borderColor: theme.borderStrong,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 12,
    },
    emptyBuildTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900' as const,
      marginBottom: 6,
    },
    emptyBuildDesc: {
      color: theme.muted,
      fontSize: 13,
      textAlign: 'center' as const,
      lineHeight: 19,
      marginBottom: 16,
    },
    emptyBuildBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    emptyBuildBtnText: {
      color: theme.white,
      fontWeight: '800' as const,
      fontSize: 13,
    },
    buildSwipeCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: 5, height: 5 },
      shadowOpacity: isLight ? 0.13 : 0.5,
      shadowRadius: 12,
      elevation: 6,
    },
    buildCardTop: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 14,
    },
    buildCardName: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '900' as const,
      marginBottom: 3,
    },
    buildCardDate: {
      color: theme.muted,
      fontSize: 11,
    },
    buildCardPricePill: {
      backgroundColor: theme.surfaceSunken,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    buildCardPrice: {
      color: theme.primary2,
      fontSize: 13,
      fontWeight: '900' as const,
    },
    buildSlotRow: {
      flexDirection: 'row' as const,
      gap: 6,
      marginBottom: 14,
      flexWrap: 'wrap' as const,
    },
    buildSlotDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    buildProgressBg: {
      height: 4,
      backgroundColor: theme.surfaceSunken,
      borderRadius: 2,
      marginBottom: 6,
      overflow: 'hidden' as const,
    },
    buildProgressFill: {
      height: 4,
      backgroundColor: theme.primary2,
      borderRadius: 2,
    },
    buildProgressLabel: {
      color: theme.muted,
      fontSize: 11,
    },
    dotsRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 6,
      marginTop: 10,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.borderStrong,
    },

    // ── Avatar styles ────────────────────────────────────────────────────────
    heroAvatarImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    profileAvatarImg: {
      width: 86,
      height: 86,
      borderRadius: 43,
    },
    profileAvatarEdit: {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.primary2,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 2,
      borderColor: theme.background,
    },
  });
}