// app/compare-screen.tsx
// Porównanie dwóch komponentów tej samej lub różnej kategorii.
// Zwycięzca parametru → zielone podświetlenie, niekompatybilne → wyszarzone.

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
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

// ─── Which spec keys are "compatibility" fields (different = gray, no winner) ─

const COMPAT_KEYS = new Set([
  'Socket', 'Typ', 'Złącze', 'Sieć', 'Rozmiar',
  'Wyjścia wideo', 'Profil OC', 'Radiator', 'USB',
  'Sloty PCIe', 'Maks. RAM',
]);

// ─── Numeric-extracting helper ─────────────────────────────────────────────

function extractNumber(val: string | number): number | null {
  if (typeof val === 'number') return val;
  // e.g. "5.3 GHz" → 5.3, "16 GB GDDR6X" → 16, "38 MB" → 38
  const match = String(val).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Higher = better for most specs; only TDP is lower-is-better
const LOWER_IS_BETTER = new Set(['TDP', 'Opóźnienia', 'Napięcie', 'Litografia']);

type WinnerResult = 'left' | 'right' | 'tie' | 'compat' | 'unknown';

function getWinner(key: string, left: string | number, right: string | number): WinnerResult {
  if (COMPAT_KEYS.has(key)) return 'compat';

  const l = extractNumber(left);
  const r = extractNumber(right);
  if (l === null || r === null) return 'unknown';
  if (l === r) return 'tie';

  const lWins = LOWER_IS_BETTER.has(key) ? l < r : l > r;
  return lWins ? 'left' : 'right';
}

// ─── Category config ───────────────────────────────────────────────────────

const CATEGORIES: { key: ComponentType; label: string; icon: string; lib: 'ion' | 'mci' }[] = [
  { key: 'CPU',         label: 'CPU',       icon: 'chip',             lib: 'mci' },
  { key: 'GPU',         label: 'GPU',       icon: 'expansion-card',   lib: 'mci' },
  { key: 'RAM',         label: 'RAM',       icon: 'memory',           lib: 'mci' },
  { key: 'Motherboard', label: 'Płyta gł.', icon: 'developer-board',  lib: 'mci' },
];

// ─── Main screen ──────────────────────────────────────────────────────────

export default function CompareScreen() {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [leftComponent,  setLeftComponent]  = useState<Component | null>(null);
  const [rightComponent, setRightComponent] = useState<Component | null>(null);
  const [pickerSide, setPickerSide] = useState<'left' | 'right' | null>(null);
  const [filterCategory, setFilterCategory] = useState<ComponentType>('CPU');

  // Android back: close picker if open
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (pickerSide !== null) {
        setPickerSide(null);
        return true;
      }
      return false; // let parent handle (goes to home)
    });
    return () => sub.remove();
  }, [pickerSide]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openPicker = (side: 'left' | 'right') => {
    setPickerSide(side);
  };

  const handleSelect = (c: Component) => {
    if (pickerSide === 'left') setLeftComponent(c);
    else setRightComponent(c);
    setPickerSide(null);

    // Animate comparison in
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  // Merge spec keys from both selected components
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    if (leftComponent)  Object.keys(leftComponent.specs).forEach(k => keys.add(k));
    if (rightComponent) Object.keys(rightComponent.specs).forEach(k => keys.add(k));
    return Array.from(keys);
  }, [leftComponent, rightComponent]);

  // Count wins
  const wins = useMemo(() => {
    let l = 0, r = 0;
    if (!leftComponent || !rightComponent) return { left: 0, right: 0 };
    for (const key of allSpecKeys) {
      const lv = leftComponent.specs[key];
      const rv = rightComponent.specs[key];
      if (lv === undefined || rv === undefined) continue;
      const w = getWinner(key, lv, rv);
      if (w === 'left') l++;
      if (w === 'right') r++;
    }
    return { left: l, right: r };
  }, [leftComponent, rightComponent, allSpecKeys]);

  const bothSelected = !!leftComponent && !!rightComponent;

  return (
    <View style={styles.screen}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Porównanie</Text>
        <Text style={styles.headerSub}>Wybierz dwa komponenty do zestawienia</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Category filter ──────────────────────────────────────────── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              style={[styles.catChip, filterCategory === cat.key && styles.catChipActive]}
              onPress={() => setFilterCategory(cat.key)}
            >
              {cat.lib === 'mci'
                ? <MaterialCommunityIcons name={cat.icon as any} size={15} color={filterCategory === cat.key ? '#fff' : theme.muted} />
                : <Ionicons name={cat.icon as any} size={15} color={filterCategory === cat.key ? '#fff' : theme.muted} />
              }
              <Text style={[styles.catChipText, filterCategory === cat.key && { color: '#fff' }]}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Selector cards ───────────────────────────────────────────── */}
        <View style={styles.selectorRow}>
          <SelectorCard
            component={leftComponent}
            side="left"
            wins={wins.left}
            isWinner={bothSelected && wins.left > wins.right}
            theme={theme}
            styles={styles}
            onPress={() => openPicker('left')}
          />

          <View style={styles.vsWrap}>
            <Text style={styles.vsText}>VS</Text>
            {bothSelected && (
              <View style={styles.vsScore}>
                <Text style={[styles.vsScoreNum, wins.left > wins.right && { color: theme.primary2 }]}>{wins.left}</Text>
                <Text style={styles.vsScoreDash}>—</Text>
                <Text style={[styles.vsScoreNum, wins.right > wins.left && { color: theme.primary2 }]}>{wins.right}</Text>
              </View>
            )}
          </View>

          <SelectorCard
            component={rightComponent}
            side="right"
            wins={wins.right}
            isWinner={bothSelected && wins.right > wins.left}
            theme={theme}
            styles={styles}
            onPress={() => openPicker('right')}
          />
        </View>

        {/* ── Spec rows ────────────────────────────────────────────────── */}
        {bothSelected ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Cross-category notice */}
            {leftComponent.type !== rightComponent.type && (
              <View style={styles.noticeBanner}>
                <Ionicons name="information-circle-outline" size={16} color={theme.primary2} />
                <Text style={styles.noticeText}>
                  Porównujesz {leftComponent.type} z {rightComponent.type} — parametry niekompatybilne są wyszarzone.
                </Text>
              </View>
            )}

            <Text style={styles.sectionLabel}>SPECYFIKACJA</Text>

            <View style={styles.specTable}>
              {allSpecKeys.map((key, i) => {
                const lv = leftComponent.specs[key];
                const rv = rightComponent.specs[key];
                const winner = lv !== undefined && rv !== undefined
                  ? getWinner(key, lv, rv)
                  : 'unknown';
                const isCompat = winner === 'compat';
                const lMissing = lv === undefined;
                const rMissing = rv === undefined;

                return (
                  <SpecRow
                    key={key}
                    specKey={key}
                    leftVal={lv}
                    rightVal={rv}
                    winner={winner}
                    isCompat={isCompat}
                    lMissing={lMissing}
                    rMissing={rMissing}
                    isLast={i === allSpecKeys.length - 1}
                    theme={theme}
                    styles={styles}
                  />
                );
              })}
            </View>

            {/* Price comparison */}
            <Text style={styles.sectionLabel}>CENA</Text>
            <View style={styles.priceCard}>
              <PriceBar
                label={leftComponent.name}
                price={leftComponent.price}
                maxPrice={Math.max(leftComponent.price, rightComponent.price)}
                isWinner={leftComponent.price <= rightComponent.price}
                theme={theme}
              />
              <PriceBar
                label={rightComponent.name}
                price={rightComponent.price}
                maxPrice={Math.max(leftComponent.price, rightComponent.price)}
                isWinner={rightComponent.price <= leftComponent.price}
                theme={theme}
              />
            </View>
          </Animated.View>
        ) : (
          <View style={styles.emptyHint}>
            <Ionicons name="git-compare-outline" size={48} color={theme.borderStrong} />
            <Text style={styles.emptyHintText}>Wybierz dwa komponenty powyżej, aby zobaczyć porównanie</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Component picker modal ──────────────────────────────────────── */}
      {pickerSide && (
        <ComponentPickerModal
          side={pickerSide}
          filterCategory={filterCategory}
          currentLeft={leftComponent}
          currentRight={rightComponent}
          theme={theme}
          onSelect={handleSelect}
          onClose={() => setPickerSide(null)}
        />
      )}
    </View>
  );
}

// ─── Selector card ─────────────────────────────────────────────────────────

function SelectorCard({
  component, side, wins, isWinner, theme, styles, onPress,
}: {
  component: Component | null;
  side: 'left' | 'right';
  wins: number;
  isWinner: boolean;
  theme: AppTheme;
  styles: any;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      style={{ flex: 1 }}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[
        styles.selectorCard,
        isWinner && styles.selectorCardWinner,
        { transform: [{ scale }] },
      ]}>
        {component ? (
          <>
            {isWinner && (
              <View style={styles.winnerBadge}>
                <Text style={styles.winnerBadgeText}>🏆 Zwycięzca</Text>
              </View>
            )}
            <Text style={styles.selectorType}>{component.type}</Text>
            <Text style={styles.selectorBrand}>{component.brand}</Text>
            <Text style={styles.selectorName} numberOfLines={2}>{component.name}</Text>
            <Text style={styles.selectorPrice}>{component.price.toLocaleString('pl-PL')} zł</Text>
          </>
        ) : (
          <>
            <View style={styles.selectorEmpty}>
              <Ionicons name="add" size={28} color={theme.primary2} />
            </View>
            <Text style={styles.selectorEmptyText}>Wybierz{'\n'}komponent</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Spec row ──────────────────────────────────────────────────────────────

function SpecRow({
  specKey, leftVal, rightVal, winner, isCompat, lMissing, rMissing, isLast, theme, styles,
}: {
  specKey: string;
  leftVal: string | number | undefined;
  rightVal: string | number | undefined;
  winner: WinnerResult;
  isCompat: boolean;
  lMissing: boolean;
  rMissing: boolean;
  isLast: boolean;
  theme: AppTheme;
  styles: any;
}) {
  const leftWin  = winner === 'left';
  const rightWin = winner === 'right';
  const gray = isCompat && leftVal !== undefined && rightVal !== undefined
    && String(leftVal) !== String(rightVal);

  const leftStyle = [
    styles.specVal,
    leftWin  && styles.specValWinner,
    gray     && styles.specValGray,
    lMissing && styles.specValMissing,
  ];
  const rightStyle = [
    styles.specVal,
    styles.specValRight,
    rightWin && styles.specValWinner,
    gray     && styles.specValGray,
    rMissing && styles.specValMissing,
  ];

  return (
    <View style={[styles.specRow, !isLast && styles.specRowBorder]}>
      {/* Left value */}
      <View style={styles.specValWrap}>
        {leftWin && <View style={styles.winDot} />}
        <Text style={leftStyle} numberOfLines={2}>
          {lMissing ? '—' : String(leftVal)}
        </Text>
      </View>

      {/* Key label */}
      <View style={styles.specKeyWrap}>
        <Text style={[styles.specKey, gray && { color: theme.muted, opacity: 0.5 }]} numberOfLines={1}>
          {specKey}
        </Text>
        {isCompat && !gray && leftVal !== undefined && rightVal !== undefined && (
          <Ionicons name="checkmark-circle" size={12} color="#2EC27E" style={{ marginTop: 2 }} />
        )}
      </View>

      {/* Right value */}
      <View style={[styles.specValWrap, { alignItems: 'flex-end' }]}>
        <Text style={rightStyle} numberOfLines={2}>
          {rMissing ? '—' : String(rightVal)}
        </Text>
        {rightWin && <View style={styles.winDot} />}
      </View>
    </View>
  );
}

// ─── Price bar ─────────────────────────────────────────────────────────────

function PriceBar({
  label, price, maxPrice, isWinner, theme,
}: {
  label: string; price: number; maxPrice: number; isWinner: boolean; theme: AppTheme;
}) {
  const pct = maxPrice > 0 ? price / maxPrice : 1;
  const widthAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: theme.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text style={{ color: isWinner ? '#2EC27E' : theme.text, fontSize: 13, fontWeight: '800' }}>
          {price.toLocaleString('pl-PL')} zł
          {isWinner && ' ✓'}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: theme.surfaceSunken, borderRadius: 3 }}>
        <Animated.View style={{
          height: 6, borderRadius: 3,
          backgroundColor: isWinner ? '#2EC27E' : theme.primary2,
          width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }} />
      </View>
    </View>
  );
}

// ─── Component picker modal ────────────────────────────────────────────────

function ComponentPickerModal({
  side, filterCategory, currentLeft, currentRight, theme, onSelect, onClose,
}: {
  side: 'left' | 'right';
  filterCategory: ComponentType;
  currentLeft: Component | null;
  currentRight: Component | null;
  theme: AppTheme;
  onSelect: (c: Component) => void;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [localFilter, setLocalFilter] = useState<ComponentType>(filterCategory);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 80, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const available = MOCK_COMPONENTS.filter(c => c.type === localFilter);
  const otherPick = side === 'left' ? currentRight : currentLeft;

  const s = pickerStylesFn(theme);

  return (
    <Modal transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)', opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>

      <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
        <View style={s.handle} />

        <View style={s.header}>
          <Text style={s.title}>{side === 'left' ? 'Lewy' : 'Prawy'} komponent</Text>
          <Pressable style={s.closeBtn} onPress={close}>
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>

        {/* Category label — fixed, no switching inside picker */}
        <View style={s.categoryLabel}>
          <Text style={s.categoryLabelText}>
            {CATEGORIES.find(cat => cat.key === localFilter)?.label ?? localFilter}
          </Text>
          <Text style={s.categoryLabelSub}>
            {available.length} {available.length === 1 ? 'komponent' : 'komponentów'}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 40 }}>
          {available.map(c => {
            const isOtherPick = otherPick?.id === c.id;
            return (
              <Pressable
                key={c.id}
                style={[s.item, isOtherPick && { opacity: 0.4 }]}
                onPress={() => !isOtherPick && onSelect(c)}
                disabled={isOtherPick}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.itemBrand}>{c.brand} · {c.generation}</Text>
                  <Text style={s.itemName}>{c.name}</Text>
                  <Text style={s.itemSpec}>
                    {Object.entries(c.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </Text>
                </View>
                <Text style={s.itemPrice}>{c.price.toLocaleString('pl-PL')} zł</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const pickerStylesFn = (theme: AppTheme) => StyleSheet.create({
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '80%',
    backgroundColor: theme.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0, borderColor: theme.borderStrong,
    paddingHorizontal: 18, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 18,
  },
  handle: { width: 38, height: 4, borderRadius: 2, backgroundColor: theme.muted, opacity: 0.35, alignSelf: 'center', marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { color: theme.text, fontSize: 20, fontWeight: '900' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderStrong, justifyContent: 'center', alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderStrong },
  chipActive: { backgroundColor: theme.primary, borderColor: theme.primary2 },
  chipText: { color: theme.muted, fontSize: 13, fontWeight: '700' },
  categoryLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 2 },
  categoryLabelText: { color: theme.text, fontSize: 15, fontWeight: '800' as const },
  categoryLabelSub: { color: theme.muted, fontSize: 12 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 16, borderWidth: 1.5, borderColor: theme.borderStrong, paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  itemBrand: { color: theme.muted, fontSize: 10, marginBottom: 2 },
  itemName: { color: theme.text, fontSize: 14, fontWeight: '800', marginBottom: 3 },
  itemSpec: { color: theme.muted, fontSize: 11 },
  itemPrice: { color: theme.primary2, fontSize: 14, fontWeight: '900' },
});

// ─── Styles ────────────────────────────────────────────────────────────────

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
    scroll: { paddingHorizontal: 18, paddingTop: 4 },

    // Filter
    filterRow: { gap: 8, paddingBottom: 14, height: 50 },
    catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.borderStrong, ...neu },
    catChipActive: { backgroundColor: theme.primary, borderColor: theme.primary2 },
    catChipText: { color: theme.muted, fontSize: 13, fontWeight: '700' },

    // Selector row
    selectorRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 20 },
    selectorCard: {
      backgroundColor: theme.card, borderRadius: 20, padding: 14,
      borderWidth: 1.5, borderColor: theme.borderStrong, minHeight: 130,
      justifyContent: 'center', alignItems: 'center', ...neu,
    },
    selectorCardWinner: { borderColor: '#2EC27E', backgroundColor: isLight ? '#f0fdf4' : '#0d1f14' },
    winnerBadge: { position: 'absolute', top: -1, left: -1, right: -1, backgroundColor: '#2EC27E', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingVertical: 4, alignItems: 'center' },
    winnerBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    selectorType: { color: theme.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4, marginTop: 20 },
    selectorBrand: { color: theme.textSecondary, fontSize: 11, marginBottom: 2 },
    selectorName: { color: theme.text, fontSize: 13, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
    selectorPrice: { color: theme.primary2, fontSize: 13, fontWeight: '800' },
    selectorEmpty: { width: 52, height: 52, borderRadius: 16, backgroundColor: theme.surfaceSunken, borderWidth: 1.5, borderColor: theme.primary2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    selectorEmptyText: { color: theme.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },

    // VS
    vsWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
    vsText: { color: theme.muted, fontSize: 13, fontWeight: '900', letterSpacing: 2 },
    vsScore: { marginTop: 8, alignItems: 'center' },
    vsScoreNum: { color: theme.text, fontSize: 20, fontWeight: '900' },
    vsScoreDash: { color: theme.muted, fontSize: 12 },

    // Notice
    noticeBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#1e1012', borderRadius: 12, borderWidth: 1, borderColor: '#3a1018', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
    noticeText: { color: theme.primary2, fontSize: 12, flex: 1, lineHeight: 18 },

    // Section label
    sectionLabel: { color: theme.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 12 },

    // Spec table
    specTable: { backgroundColor: theme.card, borderRadius: 22, borderWidth: 1, borderColor: theme.borderStrong, marginBottom: 22, overflow: 'hidden', ...neu },
    specRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14 },
    specRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.border },

    specValWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
    specVal: { color: theme.text, fontSize: 12, fontWeight: '700', flex: 1 },
    specValRight: { textAlign: 'right' },
    specValWinner: { color: '#2EC27E', fontWeight: '900' },
    specValGray: { color: theme.muted, opacity: 0.45 },
    specValMissing: { color: theme.muted, opacity: 0.3 },

    specKeyWrap: { flex: 1, alignItems: 'center', gap: 2 },
    specKey: { color: theme.muted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textAlign: 'center' },

    winDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2EC27E' },

    // Price card
    priceCard: { backgroundColor: theme.card, borderRadius: 20, borderWidth: 1, borderColor: theme.borderStrong, padding: 18, marginBottom: 20, ...neu },

    // Empty hint
    emptyHint: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 32, gap: 16 },
    emptyHintText: { color: theme.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  });
}