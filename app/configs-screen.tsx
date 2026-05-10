// app/configs-screen.tsx
// Ekran zestawów — lista buildów (max 3) + konfigurator

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
} from '../constants/storageKeys';
import { Component } from '../constants/mockComponents';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';
import BuildConfigurator, { BuildSlots, SlotKey } from '../components/BuildConfigurator';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Build = {
  id: string;
  name: string;
  slots: BuildSlots;
  createdAt: string;
};

const MAX_BUILDS = 3;

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ConfigsScreen({ onConfiguratorOpen }: { onConfiguratorOpen?: (hidden: boolean) => void }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [builds, setBuilds] = useState<Build[]>([]);
  const [activeBuild, setActiveBuild] = useState<Build | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [username, setUsername] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadBuilds();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const loadBuilds = async () => {
    const user = (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ?? (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));
    if (!user) return;
    setUsername(user);
    const raw = await AsyncStorage.getItem(userConfigsKey(user));
    const parsed: Build[] = raw ? JSON.parse(raw) : [];
    setBuilds(parsed);
  };

  const saveBuilds = async (updated: Build[]) => {
    if (!username) return;
    setBuilds(updated);
    await AsyncStorage.setItem(userConfigsKey(username), JSON.stringify(updated));
  };

  const handleCreateBuild = async (name: string) => {
    if (builds.length >= MAX_BUILDS) {
      Alert.alert('Limit osiągnięty', 'Możesz mieć maksymalnie 3 zestawy. Usuń jeden, aby dodać nowy.');
      return;
    }
    const newBuild: Build = {
      id: Date.now().toString(),
      name: name.trim() || `Zestaw ${builds.length + 1}`,
      slots: {},
      createdAt: new Date().toISOString(),
    };
    const updated = [...builds, newBuild];
    await saveBuilds(updated);
    setActiveBuild(newBuild);
    onConfiguratorOpen?.(true);
    setShowNewModal(false);
  };

  const handleSlotChange = async (key: SlotKey, component: Component | null) => {
    if (!activeBuild) return;
    const updatedSlots: BuildSlots = { ...activeBuild.slots };
    if (component) {
      updatedSlots[key] = component;
    } else {
      delete updatedSlots[key];
    }
    const updatedBuild: Build = { ...activeBuild, slots: updatedSlots };
    setActiveBuild(updatedBuild);
    const updated = builds.map((b) => (b.id === updatedBuild.id ? updatedBuild : b));
    await saveBuilds(updated);
  };

  const handleDeleteBuild = (id: string) => {
    Alert.alert(
      'Usuń zestaw',
      'Czy na pewno chcesz usunąć ten zestaw? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            const updated = builds.filter((b) => b.id !== id);
            await saveBuilds(updated);
            if (activeBuild?.id === id) { setActiveBuild(null); onConfiguratorOpen?.(false); }
          },
        },
      ],
    );
  };

  const handleCheckCompatibility = () => {
    if (!activeBuild) return;
    const filled = Object.keys(activeBuild.slots).length;
    if (filled < 2) {
      Alert.alert('Za mało komponentów', 'Dodaj co najmniej 2 komponenty, aby sprawdzić zgodność.');
      return;
    }
    // Basic compatibility check
    const mb = activeBuild.slots.motherboard;
    const cpu = activeBuild.slots.cpu;
    const ram = activeBuild.slots.ram;
    const issues: string[] = [];

    if (mb && cpu) {
      const mbSocket = mb.specs['Socket'] as string;
      const cpuSocket = cpu.specs['Socket'] as string;
      if (mbSocket !== cpuSocket) {
        issues.push(`❌ CPU (${cpuSocket}) niekompatybilny z płytą (${mbSocket})`);
      } else {
        issues.push(`✅ CPU zgodny z płytą główną (${mbSocket})`);
      }
    }

    if (mb && ram) {
      const mbRamSpec = mb.specs['Maks. RAM'] as string;
      const ramType = ram.specs['Typ'] as string;
      const mbDdr = mbRamSpec?.includes('DDR5') ? 'DDR5' : 'DDR4';
      if (ramType !== mbDdr) {
        issues.push(`❌ RAM (${ramType}) niekompatybilny z płytą (${mbDdr})`);
      } else {
        issues.push(`✅ RAM zgodny z płytą (${mbDdr})`);
      }
    }

    if (issues.length === 0) {
      Alert.alert('Sprawdzanie zgodności', 'Dodaj płytę główną, CPU lub RAM aby sprawdzić kompatybilność.');
    } else {
      Alert.alert('Wyniki zgodności', issues.join('\n\n'));
    }
  };

  const totalPrice = useMemo(() => {
    if (!activeBuild) return 0;
    return Object.values(activeBuild.slots).reduce((sum, c) => sum + (c?.price ?? 0), 0);
  }, [activeBuild]);

  // ── Back gesture handler (Android back + iOS swipe) ──────────────────────

  const goBackWithConfirm = useCallback(() => {
    const filled = activeBuild ? Object.keys(activeBuild.slots).length : 0;
    if (filled === 0) {
      // Nothing selected — just go back silently
      setActiveBuild(null);
      onConfiguratorOpen?.(false);
      return;
    }
    Alert.alert(
      'Wróć do listy',
      'Zmiany są zapisywane automatycznie. Czy chcesz wrócić do listy zestawów?',
      [
        { text: 'Zostań', style: 'cancel' },
        {
          text: 'Wróć',
          onPress: () => {
            setActiveBuild(null);
            onConfiguratorOpen?.(false);
          },
        },
      ],
    );
  }, [activeBuild, onConfiguratorOpen]);

  // Android hardware back button
  useEffect(() => {
    if (!activeBuild) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      goBackWithConfirm();
      return true; // prevent default back action
    });
    return () => sub.remove();
  }, [activeBuild, goBackWithConfirm]);

  // ── Active build view ────────────────────────────────────────────────────

  if (activeBuild) {
    return (
      <View style={styles.screen}>
        {/* Back header */}
        <View style={styles.configHeader}>
          <Pressable style={styles.backBtn} onPress={goBackWithConfirm}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.configTitle} numberOfLines={1}>{activeBuild.name}</Text>
            <Text style={styles.configSub}>
              {Object.keys(activeBuild.slots).length} / 8 slotów wypełnionych
            </Text>
          </View>
          <Pressable onPress={() => handleDeleteBuild(activeBuild.id)}>
            <Ionicons name="trash-outline" size={20} color={theme.primary2} />
          </Pressable>
        </View>

        <BuildConfigurator
          slots={activeBuild.slots}
          onSlotChange={handleSlotChange}
          totalPrice={totalPrice}
          onCheckCompatibility={handleCheckCompatibility}
        />
      </View>
    );
  }

  // ── Build list view ──────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konfiguracje</Text>
        <Text style={styles.headerSub}>{builds.length} / {MAX_BUILDS} zestawów</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {builds.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="desktop-outline" size={40} color={theme.primary2} />
            </View>
            <Text style={styles.emptyTitle}>Brak zestawów</Text>
            <Text style={styles.emptyDesc}>
              Utwórz swój pierwszy zestaw komputerowy i zacznij dobierać komponenty.
            </Text>
          </View>
        )}

        {builds.map((build) => (
          <BuildCard
            key={build.id}
            build={build}
            theme={theme}
            styles={styles}
            onOpen={() => { setActiveBuild(build); onConfiguratorOpen?.(true); }}
            onDelete={() => handleDeleteBuild(build.id)}
          />
        ))}

        {/* New build button */}
        {builds.length < MAX_BUILDS && (
          <Pressable
            style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setShowNewModal(true)}
          >
            <Ionicons name="add-circle-outline" size={22} color={theme.primary2} />
            <Text style={styles.newBtnText}>Nowy zestaw</Text>
          </Pressable>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* New build name modal */}
      {showNewModal && (
        <NewBuildModal
          theme={theme}
          onConfirm={handleCreateBuild}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </View>
  );
}

// ─── Build card ───────────────────────────────────────────────────────────────

function BuildCard({
  build, theme, styles, onOpen, onDelete,
}: {
  build: Build;
  theme: AppTheme;
  styles: any;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const filledCount = Object.keys(build.slots).length;
  const totalPrice = Object.values(build.slots).reduce((s, c) => s + (c?.price ?? 0), 0);
  const progress = filledCount / 8;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={onOpen}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{build.name}</Text>
            <Text style={styles.cardDate}>
              {new Date(build.createdAt).toLocaleDateString('pl-PL')}
            </Text>
          </View>
          <Pressable onPress={onDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={18} color={theme.muted} />
          </Pressable>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{filledCount} / 8 komponentów</Text>

        {/* Filled slots preview */}
        {filledCount > 0 && (
          <View style={styles.slotPreview}>
            {Object.entries(build.slots).slice(0, 4).map(([key, comp]) => (
              comp && (
                <View key={key} style={styles.slotPreviewPill}>
                  <Text style={styles.slotPreviewText} numberOfLines={1}>{comp.name}</Text>
                </View>
              )
            ))}
            {filledCount > 4 && (
              <View style={[styles.slotPreviewPill, { borderColor: theme.primary2 }]}>
                <Text style={[styles.slotPreviewText, { color: theme.primary2 }]}>+{filledCount - 4}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>
            {totalPrice > 0 ? `${totalPrice.toLocaleString('pl-PL')} zł` : '—'}
          </Text>
          <View style={styles.openBtn}>
            <Text style={styles.openBtnText}>Otwórz</Text>
            <Ionicons name="arrow-forward" size={13} color={theme.primary2} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── New build modal ──────────────────────────────────────────────────────────

function NewBuildModal({
  theme, onConfirm, onClose,
}: {
  theme: AppTheme;
  onConfirm: (name: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const s = StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      backgroundColor: theme.background, borderTopLeftRadius: 28, borderTopRightRadius: 28,
      borderWidth: 1, borderBottomWidth: 0, borderColor: theme.borderStrong,
      padding: 22, paddingTop: 14,
    },
    handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: theme.muted, opacity: 0.35, alignSelf: 'center', marginBottom: 18 },
    title: { color: theme.text, fontSize: 20, fontWeight: '900', marginBottom: 4 },
    sub: { color: theme.muted, fontSize: 13, marginBottom: 20 },
    label: { color: theme.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
    input: {
      backgroundColor: theme.surfaceSunken, color: theme.text, borderRadius: 14,
      borderWidth: 1.5, borderColor: theme.borderStrong,
      paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16,
    },
    row: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, borderColor: theme.borderStrong, paddingVertical: 14, alignItems: 'center' },
    cancelText: { color: theme.text, fontWeight: '700' },
    confirmBtn: { flex: 1, borderRadius: 14, backgroundColor: theme.primary, paddingVertical: 14, alignItems: 'center', shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    confirmText: { color: '#fff', fontWeight: '900', letterSpacing: 0.5 },
  });

  return (
    <Modal transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
        <View style={s.handle} />
        <Text style={s.title}>Nowy zestaw</Text>
        <Text style={s.sub}>Nadaj nazwę swojemu buildowi.</Text>
        <Text style={s.label}>Nazwa zestawu</Text>
        <TextInput
          style={s.input}
          placeholder="np. Gamingowy RTX"
          placeholderTextColor={theme.muted}
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => onConfirm(name)}
        />
        <View style={s.row}>
          <Pressable style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Anuluj</Text>
          </Pressable>
          <Pressable style={s.confirmBtn} onPress={() => onConfirm(name)}>
            <Text style={s.confirmText}>UTWÓRZ</Text>
          </Pressable>
        </View>
        <View style={{ height: 24 }} />
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(theme: AppTheme) {
  const isLight = theme.name === 'light';
  const neu = {
    shadowColor: theme.neuShadowDark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: isLight ? 0.13 : 0.5,
    shadowRadius: 12,
    elevation: 6,
  };

  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14 },
    headerTitle: { color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
    headerSub: { color: theme.muted, fontSize: 13, marginTop: 2 },

    list: { paddingHorizontal: 18, paddingTop: 6, gap: 14 },

    emptyState: {
      backgroundColor: theme.card, borderRadius: 24, padding: 32,
      alignItems: 'center', borderWidth: 1, borderColor: theme.borderStrong, ...neu,
    },
    emptyIcon: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: theme.surfaceSunken, borderWidth: 1, borderColor: theme.borderStrong,
      justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { color: theme.text, fontSize: 20, fontWeight: '900', marginBottom: 8 },
    emptyDesc: { color: theme.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

    card: {
      backgroundColor: theme.card, borderRadius: 22, padding: 18,
      borderWidth: 1, borderColor: theme.borderStrong, ...neu,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    cardName: { color: theme.text, fontSize: 18, fontWeight: '900' },
    cardDate: { color: theme.muted, fontSize: 11, marginTop: 2 },

    progressBg: { height: 4, backgroundColor: theme.surfaceSunken, borderRadius: 2, marginBottom: 6 },
    progressFill: { height: 4, backgroundColor: theme.primary2, borderRadius: 2 },
    progressLabel: { color: theme.muted, fontSize: 11, marginBottom: 12 },

    slotPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
    slotPreviewPill: {
      borderRadius: 8, borderWidth: 1, borderColor: theme.borderStrong,
      backgroundColor: theme.surfaceSunken, paddingHorizontal: 8, paddingVertical: 4,
    },
    slotPreviewText: { color: theme.muted, fontSize: 10, fontWeight: '600' },

    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardPrice: { color: theme.primary2, fontSize: 18, fontWeight: '900' },
    openBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    openBtnText: { color: theme.primary2, fontSize: 13, fontWeight: '700' },

    newBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      backgroundColor: theme.card, borderRadius: 18, paddingVertical: 16,
      borderWidth: 1.5, borderColor: theme.primary2, borderStyle: 'dashed', ...neu,
    },
    newBtnText: { color: theme.primary2, fontWeight: '800', fontSize: 15 },

    configHeader: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingTop: 52, paddingHorizontal: 18, paddingBottom: 10,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderStrong,
      justifyContent: 'center', alignItems: 'center',
    },
    configTitle: { color: theme.text, fontSize: 18, fontWeight: '900' },
    configSub: { color: theme.muted, fontSize: 11, marginTop: 1 },
  });
}
