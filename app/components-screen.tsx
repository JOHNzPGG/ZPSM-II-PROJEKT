// app/components-screen.tsx
// Ekran komponentów z filtrowaniem po kategorii i ekranem szczegółów

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Component,
  ComponentType,
  MOCK_COMPONENTS,
} from '../constants/mockComponents';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

// ─── Category filter config ──────────────────────────────────────────────────

type FilterKey = 'All' | ComponentType;

const FILTERS: { key: FilterKey; label: string; icon: string; lib: 'ion' | 'mci' }[] = [
  { key: 'All',         label: 'Wszystkie', icon: 'apps-outline',        lib: 'ion' },
  { key: 'CPU',         label: 'CPU',       icon: 'chip',                lib: 'mci' },
  { key: 'GPU',         label: 'GPU',       icon: 'expansion-card',      lib: 'mci' },
  { key: 'RAM',         label: 'RAM',       icon: 'memory',              lib: 'mci' },
  { key: 'Motherboard', label: 'Płyta gł.', icon: 'developer-board',     lib: 'mci' },
  { key: 'Cooler',      label: 'Chłodzenie',icon: 'fan',                 lib: 'mci' },
  { key: 'PSU',         label: 'Zasilacz',  icon: 'power-plug',          lib: 'mci' },
  { key: 'Case',        label: 'Obudowa',   icon: 'desktop-tower',       lib: 'mci' },
  { key: 'Storage',     label: 'Dysk',      icon: 'harddisk',            lib: 'mci' },
];

// Brand accent colors (consistent chip colors)
const BRAND_COLORS: Record<string, string> = {
  AMD:              '#ED1C24',
  Intel:            '#0071C5',
  NVIDIA:           '#76B900',
  Corsair:          '#FFD100',
  'G.Skill':        '#E8720C',
  Kingston:         '#CE1126',
  ASRock:           '#EF3340',
  Gigabyte:         '#E0332E',
  MSI:              '#FF0000',
  'ASUS ROG':       '#FF0029',
  ASUS:             '#00A3E0',
  Noctua:           '#B5651D',
  'be quiet!':      '#1C1C1C',
  DeepCool:         '#0096C7',
  NZXT:             '#F25022',
  'Cooler Master':  '#CC0000',
  Seasonic:         '#F5A623',
  WD:               '#E31837',
  Samsung:          '#1428A0',
  Crucial:          '#007DB8',
  Seagate:          '#00C853',
  'Lian Li':        '#A0A0A0',
  'Fractal Design': '#5C7A8C',
  TeamGroup:        '#E53935',
};

// ─── Main component ──────────────────────────────────────────────────────────

export default function ComponentsScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('All');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

  const filtered = useMemo(
    () =>
      activeFilter === 'All'
        ? MOCK_COMPONENTS
        : MOCK_COMPONENTS.filter((c) => c.type === activeFilter),
    [activeFilter],
  );

  const counts = useMemo(() => {
    const map: Partial<Record<FilterKey, number>> = { All: MOCK_COMPONENTS.length };
    for (const f of FILTERS.slice(1)) {
      map[f.key] = MOCK_COMPONENTS.filter((c) => c.type === f.key).length;
    }
    return map;
  }, []);

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Komponenty</Text>
        <Text style={styles.headerSub}>
          {filtered.length} {filtered.length === 1 ? 'komponent' : 'komponentów'}
        </Text>
      </View>

      {/* ── Filter chips ────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            filter={f}
            active={activeFilter === f.key}
            count={counts[f.key] ?? 0}
            onPress={() => setActiveFilter(f.key)}
            theme={theme}
            styles={styles}
          />
        ))}
      </ScrollView>

      {/* ── Component list ──────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((component, i) => (
          <ComponentCard
            key={component.id}
            component={component}
            index={i}
            theme={theme}
            styles={styles}
            onPress={() => setSelectedComponent(component)}
          />
        ))}
      </ScrollView>

      {/* ── Detail modal ────────────────────────────────────────────────── */}
      {selectedComponent && (
        <DetailModal
          component={selectedComponent}
          theme={theme}
          styles={styles}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </View>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

function FilterChip({
  filter, active, count, onPress, theme, styles,
}: {
  filter: typeof FILTERS[number];
  active: boolean;
  count: number;
  onPress: () => void;
  theme: AppTheme;
  styles: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.93, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.chip, active && styles.chipActive, { transform: [{ scale }] }]}>
        {filter.lib === 'mci'
          ? <MaterialCommunityIcons name={filter.icon as any} size={16} color={active ? '#fff' : theme.muted} />
          : <Ionicons name={filter.icon as any} size={16} color={active ? '#fff' : theme.muted} />
        }
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{filter.label}</Text>
        <View style={[styles.chipBadge, active && styles.chipBadgeActive]}>
          <Text style={[styles.chipBadgeText, active && { color: '#FFFFFF', fontWeight: '800' }]}>{count}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Component card ──────────────────────────────────────────────────────────

function ComponentCard({
  component, index, theme, styles, onPress,
}: {
  component: Component;
  index: number;
  theme: AppTheme;
  styles: any;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const brandColor = BRAND_COLORS[component.brand] ?? theme.primary2;

  // First 3 spec entries for preview
  const previewSpecs = Object.entries(component.specs).slice(0, 3);

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            {/* Type badge */}
            <View style={[styles.typeBadge, { borderColor: brandColor }]}>
              <Text style={[styles.typeBadgeText, { color: brandColor }]}>{component.type}</Text>
            </View>

            <Text style={styles.cardName}>{component.name}</Text>
            <Text style={styles.cardBrand}>{component.brand} · {component.generation}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceWrap}>
            <Text style={styles.price}>{component.price.toLocaleString('pl-PL')} zł</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.muted} style={{ marginTop: 2 }} />
          </View>
        </View>

        {/* Spec pills */}
        <View style={styles.specRow}>
          {previewSpecs.map(([key, val]) => (
            <View key={key} style={styles.specPill}>
              <Text style={styles.specPillKey}>{key}</Text>
              <Text style={styles.specPillVal}>{String(val)}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({
  component, theme, styles, onClose,
}: {
  component: Component;
  theme: AppTheme;
  styles: any;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const brandColor = BRAND_COLORS[component.brand] ?? theme.primary2;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 60, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}
      >
        {/* Handle */}
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <View style={[styles.typeBadge, { borderColor: brandColor, marginBottom: 8 }]}>
                <Text style={[styles.typeBadgeText, { color: brandColor }]}>{component.type}</Text>
              </View>
              <Text style={styles.sheetTitle}>{component.name}</Text>
              <Text style={styles.sheetBrand}>{component.brand} · {component.generation}</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Price banner */}
          <View style={[styles.priceBanner, { borderColor: brandColor }]}>
            <Text style={styles.priceBannerLabel}>Cena orientacyjna</Text>
            <Text style={[styles.priceBannerValue, { color: brandColor }]}>
              {component.price.toLocaleString('pl-PL')} zł
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.sheetDesc}>{component.description}</Text>

          {/* Specs */}
          <Text style={styles.sheetSectionLabel}>SPECYFIKACJA</Text>
          <View style={styles.specsCard}>
            {Object.entries(component.specs).map(([key, val], i, arr) => (
              <React.Fragment key={key}>
                <View style={styles.specDetailRow}>
                  <Text style={styles.specDetailKey}>{key}</Text>
                  <Text style={styles.specDetailVal}>{String(val)}</Text>
                </View>
                {i < arr.length - 1 && <View style={styles.specDivider} />}
              </React.Fragment>
            ))}
          </View>

          {/* Action button */}
          <Pressable style={[styles.addBtn, { backgroundColor: theme.primary2 }]}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.addBtnText}>DODAJ DO ZESTAWU</Text>
          </Pressable>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

function createStyles(theme: AppTheme) {
  const isLight = theme.name === 'light';
  const neu = {
    shadowColor: theme.neuShadowDark,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: isLight ? 0.14 : 0.5,
    shadowRadius: 12,
    elevation: 6,
  };

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    // ── Header ───────────────────────────────────────────────────────────────
    header: {
      paddingTop: 56,
      paddingHorizontal: 20,
      paddingBottom: 14,
    },
    headerTitle: {
      color: theme.text,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    headerSub: {
      color: theme.muted,
      fontSize: 13,
      marginTop: 2,
    },

    // ── Filter chips ─────────────────────────────────────────────────────────
    filterRow: {
      paddingHorizontal: 18,
      paddingBottom: 14,
      gap: 8,
      height: 50
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.card,
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neu,
    },
    chipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary2,
    },
    chipText: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    chipTextActive: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    chipBadge: {
      backgroundColor: theme.surfaceSunken,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    chipBadgeActive: {
      backgroundColor: 'rgba(255,255,255,0.22)',
    },
    chipBadgeText: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: '800',
    },

    // ── List ─────────────────────────────────────────────────────────────────
    list: {
      paddingHorizontal: 18,
      gap: 12,
      paddingBottom: 120, // nav bar height + padding so last card is fully visible
    },

    // ── Component card ───────────────────────────────────────────────────────
    card: {
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      ...neu,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    cardLeft: {
      flex: 1,
      marginRight: 12,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      borderRadius: 8,
      borderWidth: 1.5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 6,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
    },
    cardName: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '900',
      marginBottom: 3,
    },
    cardBrand: {
      color: theme.muted,
      fontSize: 13,
    },
    priceWrap: {
      alignItems: 'flex-end',
    },
    price: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '900',
    },
    specRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    specPill: {
      backgroundColor: theme.surfaceSunken,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
    specPillKey: {
      color: theme.muted,
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 1,
    },
    specPillVal: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '800',
    },

    // ── Modal / sheet ────────────────────────────────────────────────────────
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.65)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '88%',
      backgroundColor: theme.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: theme.borderStrong,
      paddingHorizontal: 20,
      paddingTop: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 20,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.muted,
      alignSelf: 'center',
      marginBottom: 20,
      opacity: 0.4,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
    },
    sheetTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    sheetBrand: {
      color: theme.muted,
      fontSize: 14,
      marginTop: 3,
    },
    closeBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderStrong,
    },
    priceBanner: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1.5,
      marginBottom: 16,
    },
    priceBannerLabel: {
      color: theme.muted,
      fontSize: 13,
      fontWeight: '600',
    },
    priceBannerValue: {
      fontSize: 22,
      fontWeight: '900',
    },
    sheetDesc: {
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 24,
    },
    sheetSectionLabel: {
      color: theme.muted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      marginBottom: 12,
    },
    specsCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      marginBottom: 20,
      ...neu,
    },
    specDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
    },
    specDetailKey: {
      color: theme.muted,
      fontSize: 14,
      fontWeight: '600',
      flex: 1,
    },
    specDetailVal: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
      textAlign: 'right',
      flex: 1,
    },
    specDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 16,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: 18,
      paddingVertical: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 8,
    },
    addBtnText: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 14,
      letterSpacing: 1.5,
    },
  });
}
