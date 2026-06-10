// app/upgrades-screen.tsx
// Ekran ulepszen — sugestie modernizacji zestawu z oceną opłacalności 1-10

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ACTIVE_USER_KEY,
  LEGACY_USERNAME_KEY,
  userConfigsKey,
} from '../constants/storageKeys';
import { Build } from './configs-screen';
import { BuildSlots } from '../components/BuildConfigurator';
import {
  CategoryUpgrade,
  UpgradeOption,
  getUpgradeSuggestions,
} from '../constants/upgradeEngine';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  budget:  { label: 'Budżet',   icon: 'cash-outline',         color: '#2EC27E' },
  balance: { label: 'Balans',   icon: 'scale-outline',         color: '#3584E4' },
  premium: { label: 'Premium',  icon: 'diamond-outline',       color: '#9141AC' },
} as const;

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function UpgradesScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [builds, setBuilds] = useState<Build[]>([]);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [upgrades, setUpgrades] = useState<CategoryUpgrade[]>([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadBuilds();
  }, []);

  useEffect(() => {
    if (builds.length > 0 && !selectedBuildId) {
      selectBuild(builds[0].id);
    }
  }, [builds]);

  const loadBuilds = async () => {
    try {
      const user =
        (await AsyncStorage.getItem(ACTIVE_USER_KEY)) ??
        (await AsyncStorage.getItem(LEGACY_USERNAME_KEY));
      if (!user) { setLoading(false); return; }
      const raw = await AsyncStorage.getItem(userConfigsKey(user));
      const parsed: Build[] = raw ? JSON.parse(raw) : [];
      setBuilds(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectBuild = (id: string) => {
    setSelectedBuildId(id);
    const build = builds.find((b) => b.id === id);
    if (!build) return;

    const suggestions = getUpgradeSuggestions(build.slots as BuildSlots);
    setUpgrades(suggestions);

    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const selectedBuild = builds.find((b) => b.id === selectedBuildId);
  const filledSlots = selectedBuild ? Object.keys(selectedBuild.slots).length : 0;

  // ── Empty states ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary2} />
      </View>
    );
  }

  if (builds.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ulepszenia</Text>
          <Text style={styles.headerSub}>Sugestie modernizacji zestawu</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="rocket-outline" size={44} color={theme.primary2} />
          </View>
          <Text style={styles.emptyTitle}>Brak zestawów</Text>
          <Text style={styles.emptyDesc}>
            Utwórz zestaw w zakładce Zestawy i dodaj do niego CPU, aby zobaczyć sugestie modernizacji.
          </Text>
        </View>
      </View>
    );
  }

  if (filledSlots === 0 || (selectedBuild && !selectedBuild.slots.cpu)) {
    return (
      <View style={styles.screen}>
        <Header styles={styles} />
        <BuildPicker builds={builds} selectedId={selectedBuildId} onSelect={selectBuild} theme={theme} styles={styles} />
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="chip" size={44} color={theme.primary2} />
          </View>
          <Text style={styles.emptyTitle}>Brak CPU w zestawie</Text>
          <Text style={styles.emptyDesc}>
            Dodaj procesor do wybranego zestawu, aby zobaczyć sugestie ulepszenia.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header styles={styles} />
      <BuildPicker
        builds={builds}
        selectedId={selectedBuildId}
        onSelect={selectBuild}
        theme={theme}
        styles={styles}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {upgrades.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={theme.primary2} />
              <Text style={styles.emptyTitle}>Zestaw jest już optymalny</Text>
              <Text style={styles.emptyDesc}>Nie znaleziono lepszych opcji dla Twojego procesora.</Text>
            </View>
          )}

          {upgrades.map((cat) => (
            <CategorySection
              key={cat.slotKey}
              upgrade={cat}
              theme={theme}
              styles={styles}
            />
          ))}

        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ styles }: { styles: any }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Ulepszenia</Text>
      <Text style={styles.headerSub}>Sugestie modernizacji zestawu</Text>
    </View>
  );
}

// ─── Build picker ─────────────────────────────────────────────────────────────

function BuildPicker({
  builds, selectedId, onSelect, theme, styles,
}: {
  builds: Build[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  theme: AppTheme;
  styles: any;
}) {
  if (builds.length === 1) return null; // only one build — skip picker

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pickerRow}
    >
      {builds.map((b) => {
        const active = b.id === selectedId;
        return (
          <Pressable
            key={b.id}
            style={[styles.pickerChip, active && styles.pickerChipActive]}
            onPress={() => onSelect(b.id)}
          >
            <Text style={[styles.pickerChipText, active && { color: '#fff' }]} numberOfLines={1}>
              {b.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategorySection({
  upgrade, theme, styles,
}: {
  upgrade: CategoryUpgrade;
  theme: AppTheme;
  styles: any;
}) {
  const label = upgrade.slotKey === 'cpu' ? 'Procesor (CPU)' : upgrade.slotKey.toUpperCase();

  return (
    <View style={{ marginBottom: 28 }}>
      {/* Current component card */}
      <Text style={styles.sectionLabel}>OBECNY {label.toUpperCase()}</Text>
      <CurrentCard component={upgrade.current} theme={theme} styles={styles} />

      {/* Summary */}
      <View style={styles.summaryBanner}>
        <Ionicons name="bulb-outline" size={16} color={theme.primary2} />
        <Text style={styles.summaryText}>{upgrade.summary}</Text>
      </View>

      {/* Upgrade options */}
      {upgrade.options.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>REKOMENDOWANE ULEPSZENIA</Text>
          {upgrade.options.map((opt) => (
            <UpgradeCard key={opt.component.id} option={opt} current={upgrade.current} theme={theme} styles={styles} />
          ))}
        </>
      )}
    </View>
  );
}

// ─── Current component card ───────────────────────────────────────────────────

function CurrentCard({ component, theme, styles }: { component: any; theme: AppTheme; styles: any }) {
  return (
    <View style={styles.currentCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.currentLabel}>{component.brand} · {component.generation}</Text>
        <Text style={styles.currentName}>{component.name}</Text>
        <View style={styles.currentMeta}>
          <Text style={styles.currentMetaText}>Score: {component.score}/100</Text>
          <Text style={styles.currentMetaDot}>·</Text>
          <Text style={styles.currentMetaText}>{component.price.toLocaleString('pl-PL')} zł</Text>
          <Text style={styles.currentMetaDot}>·</Text>
          <Text style={styles.currentMetaText}>{String(component.specs['Socket'] ?? '')}</Text>
        </View>
      </View>
      <View style={styles.scoreCircle}>
        <Text style={styles.scoreCircleNum}>{component.score}</Text>
        <Text style={styles.scoreCircleSub}>/ 100</Text>
      </View>
    </View>
  );
}

// ─── Upgrade card ─────────────────────────────────────────────────────────────

function UpgradeCard({
  option, current, theme, styles,
}: {
  option: UpgradeOption;
  current: any;
  theme: AppTheme;
  styles: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = TIER_CONFIG[option.tier];
  const profColor = option.profitabilityColor;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.upgradeCard, { transform: [{ scale }] }]}>

        {/* Tier badge */}
        <View style={[styles.tierBadge, { backgroundColor: cfg.color }]}>
          <Ionicons name={cfg.icon as any} size={12} color="#fff" />
          <Text style={styles.tierBadgeText}>{cfg.label}</Text>
        </View>

        {/* Header row */}
        <View style={styles.upgradeHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.upgradeBrand}>{option.component.brand} · {option.component.generation}</Text>
            <Text style={styles.upgradeName}>{option.component.name}</Text>
          </View>
          {/* Profitability score */}
          <View style={[styles.profCircle, { borderColor: profColor }]}>
            <Text style={[styles.profScore, { color: profColor }]}>{option.profitabilityScore}</Text>
            <Text style={styles.profMax}>/10</Text>
          </View>
        </View>

        {/* Profitability label */}
        <View style={[styles.profLabelRow, { backgroundColor: profColor + '22' }]}>
          <View style={[styles.profDot, { backgroundColor: profColor }]} />
          <Text style={[styles.profLabel, { color: profColor }]}>
            {option.profitabilityLabel} — Opłacalność {option.profitabilityScore}/10
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatPill
            label="Wzrost wydajn."
            value={`+${option.scorePercent}%`}
            color="#2EC27E"
            theme={theme}
          />
          <StatPill
            label="Różnica ceny"
            value={option.priceDelta >= 0
              ? `+${option.priceDelta.toLocaleString('pl-PL')} zł`
              : `${option.priceDelta.toLocaleString('pl-PL')} zł`}
            color={option.priceDelta <= 0 ? '#2EC27E' : option.priceDelta > 500 ? '#E83040' : '#FFD100'}
            theme={theme}
          />
          <StatPill
            label="Cena"
            value={`${option.component.price.toLocaleString('pl-PL')} zł`}
            color={theme.textSecondary}
            theme={theme}
          />
        </View>

        {/* Score bar */}
        <View style={styles.scoreBarSection}>
          <View style={styles.scoreBarRow}>
            <Text style={styles.scoreBarLabel}>Obecny</Text>
            <Text style={styles.scoreBarLabel}>Nowy</Text>
          </View>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, {
              width: `${current.score}%`,
              backgroundColor: theme.muted,
            }]} />
          </View>
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, {
              width: `${option.component.score}%`,
              backgroundColor: option.profitabilityScore >= 7 ? '#2EC27E' : theme.primary2,
            }]} />
          </View>
        </View>

        {/* Platform change warning */}
        {option.requiresPlatformChange && (
          <View style={styles.platformWarn}>
            <Ionicons name="warning-outline" size={14} color="#FFD100" />
            <Text style={styles.platformWarnText}>
              Wymaga zmiany płyty głównej ({String(option.component.specs['Socket'])})
            </Text>
          </View>
        )}

        {/* Note */}
        <Text style={styles.upgradeNote}>{option.note}</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, color, theme }: { label: string; value: string; color: string; theme: AppTheme }) {
  return (
    <View style={{
      flex: 1, backgroundColor: theme.surfaceSunken, borderRadius: 10,
      padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
    }}>
      <Text style={{ color: theme.muted, fontSize: 9, fontWeight: '600', marginBottom: 3, letterSpacing: 0.3 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ color, fontSize: 13, fontWeight: '900' }}>{value}</Text>
    </View>
  );
}

// Dummy ActivityIndicator import fix
const ActivityIndicator = require('react-native').ActivityIndicator;

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

    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 10 },
    headerTitle: { color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
    headerSub: { color: theme.muted, fontSize: 13, marginTop: 2 },

    pickerRow: { paddingHorizontal: 18, paddingBottom: 10, gap: 8, height: 50 },
    pickerChip: {
      paddingHorizontal: 16, paddingVertical: 8,
      borderRadius: 999, backgroundColor: theme.card,
      borderWidth: 1, borderColor: theme.borderStrong,
    },
    pickerChipActive: { backgroundColor: theme.primary, borderColor: theme.primary2 },
    pickerChipText: { color: theme.muted, fontSize: 13, fontWeight: '700' },

    scroll: { paddingHorizontal: 18, paddingTop: 4 },

    sectionLabel: {
      color: theme.muted, fontSize: 11, fontWeight: '700',
      letterSpacing: 2, marginBottom: 10, marginTop: 4,
    },

    // Current card
    currentCard: {
      backgroundColor: theme.card, borderRadius: 20, padding: 18,
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: theme.borderStrong, marginBottom: 12, ...neu,
    },
    currentLabel: { color: theme.muted, fontSize: 11, marginBottom: 3 },
    currentName: { color: theme.text, fontSize: 17, fontWeight: '900', marginBottom: 6 },
    currentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    currentMetaText: { color: theme.textSecondary, fontSize: 12 },
    currentMetaDot: { color: theme.muted, fontSize: 12 },
    scoreCircle: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: theme.surfaceSunken, borderWidth: 1.5,
      borderColor: theme.borderStrong, justifyContent: 'center', alignItems: 'center',
    },
    scoreCircleNum: { color: theme.text, fontSize: 18, fontWeight: '900', lineHeight: 20 },
    scoreCircleSub: { color: theme.muted, fontSize: 9, fontWeight: '600' },

    // Summary banner
    summaryBanner: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 8,
      backgroundColor: theme.surfaceSunken, borderRadius: 12,
      borderWidth: 1, borderColor: theme.borderStrong,
      paddingHorizontal: 14, paddingVertical: 10, marginBottom: 18,
    },
    summaryText: { color: theme.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 },

    // Upgrade card
    upgradeCard: {
      backgroundColor: theme.card, borderRadius: 22, padding: 18,
      borderWidth: 1, borderColor: theme.borderStrong, marginBottom: 14, ...neu,
    },
    tierBadge: {
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
      borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12,
    },
    tierBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

    upgradeHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    upgradeBrand: { color: theme.muted, fontSize: 11, marginBottom: 3 },
    upgradeName: { color: theme.text, fontSize: 17, fontWeight: '900' },

    profCircle: {
      width: 54, height: 54, borderRadius: 27, borderWidth: 2,
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: theme.surfaceSunken,
    },
    profScore: { fontSize: 20, fontWeight: '900', lineHeight: 22 },
    profMax: { color: theme.muted, fontSize: 9, fontWeight: '600' },

    profLabelRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
    },
    profDot: { width: 8, height: 8, borderRadius: 4 },
    profLabel: { fontSize: 13, fontWeight: '700' },

    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },

    // Score bars
    scoreBarSection: { marginBottom: 12 },
    scoreBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    scoreBarLabel: { color: theme.muted, fontSize: 10, fontWeight: '600' },
    scoreBarBg: {
      height: 6, backgroundColor: theme.surfaceSunken,
      borderRadius: 3, marginBottom: 6, overflow: 'hidden',
    },
    scoreBarFill: { height: 6, borderRadius: 3 },

    // Platform warning
    platformWarn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: '#2a2000', borderRadius: 8, borderWidth: 1,
      borderColor: '#FFD10044', paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10,
    },
    platformWarnText: { color: '#FFD100', fontSize: 12, fontWeight: '600', flex: 1 },

    upgradeNote: { color: theme.muted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

    // Empty state
    emptyState: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 32, paddingTop: 48, gap: 14,
    },
    emptyIcon: {
      width: 80, height: 80, borderRadius: 40,
      backgroundColor: theme.surfaceSunken, borderWidth: 1,
      borderColor: theme.borderStrong, justifyContent: 'center', alignItems: 'center',
    },
    emptyTitle: { color: theme.text, fontSize: 20, fontWeight: '900', textAlign: 'center' },
    emptyDesc: { color: theme.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  });
}
