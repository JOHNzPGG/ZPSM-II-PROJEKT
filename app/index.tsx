import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { getActiveUser } from '../services/storageService';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../contexts/AppThemeContext';
import {
  checkAndUpdateDatabase,
  DatabaseStatus,
} from '../services/componentDatabase';

export default function IndexGate() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Uruchamianie...');
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  const { theme } = useAppTheme();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    init();
  }, []);

  const init = async () => {
    try {
      // 1. Sprawdz usera
      setStatusMessage('Sprawdzanie profilu...');
      const activeUser = await getActiveUser();
      setHasUser(Boolean(activeUser));

      // 2. Sprawdz i zaktualizuj baze komponentow
      const result = await checkAndUpdateDatabase((msg) => setStatusMessage(msg));
      setDbStatus(result.status);

      // Pokaz baner offline przez chwile zanim przejdziemy dalej
      if (result.status === 'offline_fallback' || result.status === 'error') {
        setShowOfflineBanner(true);
        setStatusMessage(result.message);

        Animated.timing(bannerAnim, {
          toValue: 1, duration: 300, useNativeDriver: true,
        }).start();

        // Poczekaj 2.5s zeby uzytkownik przeczytał komunikat
        await new Promise((r) => setTimeout(r, 2500));
      } else if (result.status === 'updated') {
        setStatusMessage(result.message);
        await new Promise((r) => setTimeout(r, 800));
      }

    } catch (error) {
      console.error('Blad inicjalizacji', error);
      setHasUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    const isOffline = dbStatus === 'offline_fallback' || dbStatus === 'error';
    const isUpdated = dbStatus === 'updated';

    return (
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo */}
          <View style={[styles.logoOuter, { backgroundColor: theme.surfaceSunken, borderColor: theme.borderStrong }]}>
            <View style={[styles.logoInner, { backgroundColor: theme.card }]}>
              <Text style={[styles.logoPC, { color: theme.primary2 }]}>PC</Text>
              <Text style={[styles.logoUA, { color: theme.textSecondary }]}>UA</Text>
            </View>
          </View>

          <Text style={[styles.appName, { color: theme.text }]}>PC Upgrade Advisor</Text>
          <Text style={[styles.appTagline, { color: theme.muted }]}>Twój asystent modernizacji</Text>

          {/* Status */}
          <View style={styles.statusRow}>
            {isOffline ? (
              <Ionicons name="cloud-offline-outline" size={16} color="#FFD100" />
            ) : isUpdated ? (
              <Ionicons name="checkmark-circle-outline" size={16} color="#2EC27E" />
            ) : (
              <ActivityIndicator size="small" color={theme.primary2} />
            )}
            <Text style={[
              styles.statusText,
              { color: isOffline ? '#FFD100' : isUpdated ? '#2EC27E' : theme.muted },
            ]}>
              {statusMessage}
            </Text>
          </View>

          {/* Offline banner */}
          {showOfflineBanner && (
            <Animated.View
              style={[
                styles.offlineBanner,
                {
                  backgroundColor: isOffline ? '#2a1f00' : '#1e1012',
                  borderColor: isOffline ? '#FFD100' : '#E83040',
                  opacity: bannerAnim,
                  transform: [{
                    translateY: bannerAnim.interpolate({
                      inputRange: [0, 1], outputRange: [10, 0],
                    }),
                  }],
                },
              ]}
            >
              <Ionicons
                name={isOffline ? 'wifi-outline' : 'alert-circle-outline'}
                size={18}
                color={isOffline ? '#FFD100' : '#E83040'}
              />
              <Text style={[
                styles.offlineBannerText,
                { color: isOffline ? '#FFD100' : '#E83040' },
              ]}>
                {dbStatus === 'offline_fallback'
                  ? 'Brak połączenia z internetem — używam zapisanej wersji bazy danych.'
                  : 'Nie udało się pobrać aktualizacji. Sprawdź połączenie i uruchom ponownie.'}
              </Text>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    );
  }

  return <Redirect href={hasUser ? '/home' : '/setup'} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  logoOuter: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  logoInner: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  logoPC: { fontSize: 22, fontWeight: '900', letterSpacing: 1, lineHeight: 24 },
  logoUA: { fontSize: 11, fontWeight: '700', letterSpacing: 3, lineHeight: 14 },
  appName: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  appTagline: { fontSize: 14, marginBottom: 36 },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 16,
  },
  statusText: { fontSize: 13 },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
    marginTop: 8, width: '100%',
  },
  offlineBannerText: {
    fontSize: 13, lineHeight: 19, flex: 1, fontWeight: '600',
  },
});
