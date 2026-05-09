// components/BuildConfigurator.tsx
// Interaktywny konfigurator zestawu PC — SVG obudowa + sloty + bottom sheet wyboru

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
import Svg, {
  Circle,
  Ellipse,
  Polyline,
  Defs,
  Marker,
  Rect,
  G,
} from 'react-native-svg';
import {
  Component,
  ComponentType,
  MOCK_COMPONENTS,
} from '../constants/mockComponents';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SlotKey =
  | 'cpu' | 'cooler' | 'gpu' | 'psu'
  | 'motherboard' | 'ram' | 'ssd' | 'case';

export type BuildSlots = Partial<Record<SlotKey, Component>>;

type SlotDef = {
  key: SlotKey;
  label: string;
  type: ComponentType | null; // null = not yet in mock (cooler, psu, case)
  side: 'left' | 'right';
  // connector endpoint on PC SVG (out of 102×210)
  pcX: number;
  pcY: number;
};

const SLOT_DEFS: SlotDef[] = [
  // left column (top→bottom)
  { key: 'cpu',         label: 'CPU',       type: 'CPU',         side: 'left',  pcX: 0,   pcY: 52  },
  { key: 'cooler',      label: 'Chłodzenie',type: null,          side: 'left',  pcX: 0,   pcY: 105 },
  { key: 'gpu',         label: 'GPU',       type: 'GPU',         side: 'left',  pcX: 0,   pcY: 158 },
  { key: 'psu',         label: 'PSU',       type: null,          side: 'left',  pcX: 0,   pcY: 190 },
  // right column (top→bottom)
  { key: 'motherboard', label: 'Płyta gł.', type: 'Motherboard', side: 'right', pcX: 102, pcY: 52  },
  { key: 'ram',         label: 'RAM',       type: 'RAM',         side: 'right', pcX: 102, pcY: 105 },
  { key: 'ssd',         label: 'SSD',       type: null,          side: 'right', pcX: 102, pcY: 158 },
  { key: 'case',        label: 'Obudowa',   type: null,          side: 'right', pcX: 102, pcY: 190 },
];

// Brand colors
const BRAND_COLOR: Record<string, string> = {
  AMD: '#ED1C24', Intel: '#0071C5', NVIDIA: '#76B900',
  Corsair: '#FFD100', 'G.Skill': '#E8720C', Kingston: '#CE1126',
  ASRock: '#EF3340', Gigabyte: '#E0332E', MSI: '#FF0000', 'ASUS ROG': '#FF0029',
};

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  slots: BuildSlots;
  onSlotChange: (key: SlotKey, component: Component | null) => void;
  totalPrice: number;
  onCheckCompatibility: () => void;
};

// ─── Main component ──────────────────────────────────────────────────────────

export default function BuildConfigurator({
  slots,
  onSlotChange,
  totalPrice,
  onCheckCompatibility,
}: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeSlot, setActiveSlot] = useState<SlotDef | null>(null);

  // Layout constants (dp)
  const AREA_W = 340;
  const AREA_H = 490;
  const SLOT_W = 88;
  const SLOT_H = 100;
  const PC_W = 102;
  const PC_H = 210;
  const PC_X = (AREA_W - PC_W) / 2; // 119
  const PC_Y = (AREA_H - PC_H) / 2; // 140

  const leftSlots  = SLOT_DEFS.filter((s) => s.side === 'left');
  const rightSlots = SLOT_DEFS.filter((s) => s.side === 'right');

  const slotTopFor = (index: number) => {
    // 4 slots per side, distribute vertically with equal spacing
    const totalUsed = 4 * SLOT_H;
    const gap = (AREA_H - totalUsed) / 5;
    return gap + index * (SLOT_H + gap);
  };

  // SVG connector line for a slot
  const connectorFor = (def: SlotDef, index: number) => {
    const filled = !!slots[def.key];
    const slotCY = slotTopFor(index) + SLOT_H / 2;
    const pcAbsX = def.side === 'left' ? PC_X : PC_X + PC_W;
    const pcAbsY = PC_Y + def.pcY;

    // Elbow: go horizontally from slot edge to midpoint, then diagonally
    const slotEdgeX = def.side === 'left' ? SLOT_W : AREA_W - SLOT_W;
    const midX = def.side === 'left'
      ? slotEdgeX + (pcAbsX - slotEdgeX) * 0.45
      : slotEdgeX - (slotEdgeX - pcAbsX) * 0.45;

    const pts = `${slotEdgeX},${slotCY} ${midX},${slotCY} ${pcAbsX},${pcAbsY}`;
    const color = filled ? theme.primary2 : '#444';
    const dash = filled ? undefined : '5,4';

    return (
      <Polyline
        key={def.key}
        points={pts}
        stroke={color}
        strokeWidth={1.3}
        strokeDasharray={dash}
        fill="none"
        opacity={filled ? 0.8 : 0.55}
      />
    );
  };

  const handleSlotPress = (def: SlotDef) => {
    if (def.type === null) return; // slot not implemented yet
    setActiveSlot(def);
  };

  return (
    <View style={styles.root}>
      {/* ── Build area — centered vertically ───────────────────────────── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: AREA_W, height: AREA_H }}>

        {/* SVG connectors */}
        <Svg
          width={AREA_W}
          height={AREA_H}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <Marker
              id="dot-filled"
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
            >
              <Circle cx="2.5" cy="2.5" r="2" fill={theme.primary2} />
            </Marker>
            <Marker
              id="dot-empty"
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
            >
              <Circle cx="2.5" cy="2.5" r="2" fill="#444" />
            </Marker>
          </Defs>
          {leftSlots.map((def, i) => connectorFor(def, i))}
          {rightSlots.map((def, i) => connectorFor(def, i))}
        </Svg>

        {/* PC illustration */}
        <View
          style={{
            position: 'absolute',
            left: PC_X,
            top: PC_Y,
            width: PC_W,
            height: PC_H,
          }}
        >
          <PcIllustration theme={theme} />
        </View>

        {/* Left slots */}
        {leftSlots.map((def, i) => (
          <SlotCard
            key={def.key}
            def={def}
            component={slots[def.key] ?? null}
            style={{ position: 'absolute', left: 0, top: slotTopFor(i), width: SLOT_W, height: SLOT_H }}
            theme={theme}
            onPress={() => handleSlotPress(def)}
          />
        ))}

        {/* Right slots */}
        {rightSlots.map((def, i) => (
          <SlotCard
            key={def.key}
            def={def}
            component={slots[def.key] ?? null}
            style={{ position: 'absolute', right: 0, top: slotTopFor(i), width: SLOT_W, height: SLOT_H }}
            theme={theme}
            onPress={() => handleSlotPress(def)}
          />
        ))}
      </View>
      </View>{/* end centering wrapper */}

      {/* ── Bottom bar ─────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Szacowany koszt</Text>
          <Text style={styles.priceValue}>
            {totalPrice > 0 ? `${totalPrice.toLocaleString('pl-PL')} zł` : '— zł'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.compatBtn, pressed && { opacity: 0.85 }]}
          onPress={onCheckCompatibility}
        >
          <Text style={styles.compatBtnText}>Sprawdź zgodność</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </Pressable>
      </View>

      {/* ── Component picker modal ──────────────────────────────────────── */}
      {activeSlot && (
        <ComponentPicker
          slot={activeSlot}
          slots={slots}
          theme={theme}
          onSelect={(c) => {
            onSlotChange(activeSlot.key, c);
            setActiveSlot(null);
          }}
          onRemove={() => {
            onSlotChange(activeSlot.key, null);
            setActiveSlot(null);
          }}
          onClose={() => setActiveSlot(null)}
        />
      )}
    </View>
  );
}

// ─── PC Illustration ─────────────────────────────────────────────────────────

function PcIllustration({ theme }: { theme: AppTheme }) {
  // Fan blade helper
  const FanBlades = ({ cx, cy, r, offset = 0 }: { cx: number; cy: number; r: number; offset?: number }) =>
    [0, 60, 120, 180, 240, 300].map((angle, i) => (
      <Ellipse
        key={i}
        cx={cx}
        cy={cy - r + 4}
        rx={5}
        ry={r - 4}
        fill={i % 2 === 0 ? '#2e3235' : '#2a2f32'}
        transform={`rotate(${angle + offset}, ${cx}, ${cy})`}
      />
    ));

  return (
    <Svg width={102} height={210} viewBox="0 0 102 210">
      {/* Chassis */}
      <Rect x={1} y={1} width={100} height={208} rx={8} fill="#141618" stroke="#2a2d30" strokeWidth={1.5} />
      {/* Glass panel */}
      <Rect x={6} y={6} width={90} height={198} rx={6} fill="#1a1c1e" stroke="#252830" strokeWidth={1} />
      {/* RGB strips */}
      <Rect x={12} y={10} width={78} height={3} rx={1.5} fill="#E83040" opacity={0.55} />
      <Rect x={12} y={197} width={78} height={3} rx={1.5} fill="#3584E4" opacity={0.4} />

      {/* FAN 1 — cy=75 */}
      <Circle cx={51} cy={75} r={32} fill="#1c1e21" stroke="#2a2d30" strokeWidth={1.5} />
      <Circle cx={51} cy={75} r={24} fill="#222528" stroke="#2e3235" strokeWidth={1} />
      <FanBlades cx={51} cy={75} r={22} offset={0} />
      <Circle cx={51} cy={75} r={9} fill="#181a1d" stroke="#333" strokeWidth={1} />
      <Circle cx={51} cy={75} r={3.5} fill="#E83040" opacity={0.9} />

      {/* FAN 2 — cy=150 */}
      <Circle cx={51} cy={150} r={32} fill="#1c1e21" stroke="#2a2d30" strokeWidth={1.5} />
      <Circle cx={51} cy={150} r={24} fill="#222528" stroke="#2e3235" strokeWidth={1} />
      <FanBlades cx={51} cy={150} r={22} offset={30} />
      <Circle cx={51} cy={150} r={9} fill="#181a1d" stroke="#333" strokeWidth={1} />
      <Circle cx={51} cy={150} r={3.5} fill="#3584E4" opacity={0.9} />

      {/* Front I/O */}
      <Rect x={30} y={200} width={5} height={3} rx={1} fill="#333" />
      <Rect x={38} y={200} width={5} height={3} rx={1} fill="#333" />
      <Circle cx={50} cy={201.5} r={1.5} fill="#E83040" opacity={0.7} />
      <Rect x={54} y={200} width={8} height={3} rx={1} fill="#2a2d30" />
      <Rect x={64} y={200} width={5} height={3} rx={1} fill="#333" />
    </Svg>
  );
}

// ─── Slot card ────────────────────────────────────────────────────────────────

function SlotCard({
  def, component, style, theme, onPress,
}: {
  def: SlotDef;
  component: Component | null;
  style: object;
  theme: AppTheme;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const isAvailable = def.type !== null;
  const filled = !!component;
  const brandColor = component ? (BRAND_COLOR[component.brand] ?? theme.primary2) : theme.muted;

  return (
    <Pressable
      onPressIn={() => isAvailable && Animated.spring(scale, { toValue: 0.93, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={onPress}
      disabled={!isAvailable}
    >
      <Animated.View
        style={[
          style,
          {
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: filled ? theme.primary2 : isAvailable ? '#333' : '#222',
            backgroundColor: filled ? '#1e1012' : theme.card,
            padding: 8,
            transform: [{ scale }],
          },
        ]}
      >
        {/* Label */}
        <Text style={{ fontSize: 8, fontWeight: '700', letterSpacing: 1.2, color: filled ? '#7a2030' : '#4a5260', textTransform: 'uppercase', marginBottom: 3 }}>
          {def.label}
        </Text>

        {filled ? (
          <>
            {/* Brand dot */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: brandColor }} />
              <Text style={{ fontSize: 9, color: '#6A7280' }}>{component!.brand}</Text>
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary2, lineHeight: 14 }} numberOfLines={2}>
              {component!.name}
            </Text>
            <Text style={{ fontSize: 9, color: '#4a5260', marginTop: 3 }}>
              {component!.price.toLocaleString('pl-PL')} zł
            </Text>
          </>
        ) : (
          <>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: isAvailable ? '#1e2124' : '#181a1c', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="add" size={26} color={isAvailable ? theme.primary2 : '#2a2d30'} />
            </View>
            <Text style={{ fontSize: 10, color: isAvailable ? '#4a5260' : '#2a2d30' }}>
              {isAvailable ? 'Nie wybrano' : 'Wkrótce'}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Component picker bottom sheet ───────────────────────────────────────────

function ComponentPicker({
  slot, slots, theme, onSelect, onRemove, onClose,
}: {
  slot: SlotDef;
  slots: BuildSlots;
  theme: AppTheme;
  onSelect: (c: Component) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const current = slots[slot.key] ?? null;

  // Filter components for this slot type
  // If motherboard selected, filter CPU by socket and RAM by DDR type
  const available = useMemo(() => {
    if (!slot.type) return [];
    const base = MOCK_COMPONENTS.filter((c) => c.type === slot.type);

    const mb = slots.motherboard;
    if (!mb) return base;

    const mbSocket = mb.specs['Socket'] as string | undefined;
    const mbRam = mb.specs['Maks. RAM'] as string | undefined;

    if (slot.type === 'CPU' && mbSocket) {
      return base.filter((c) => String(c.specs['Socket']) === mbSocket);
    }
    if (slot.type === 'RAM' && mbRam) {
      const ddrType = mbRam.includes('DDR5') ? 'DDR5' : 'DDR4';
      return base.filter((c) => String(c.specs['Typ']) === ddrType);
    }
    return base;
  }, [slot, slots]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 65, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 80, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const mb = slots.motherboard;
  const filterNote = mb && (slot.type === 'CPU' || slot.type === 'RAM')
    ? `Filtrowane pod ${mb.name}`
    : null;

  return (
    <Modal transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.65)', opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[pickerStyles(theme).sheet, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
        {/* Handle */}
        <View style={pickerStyles(theme).handle} />

        {/* Header */}
        <View style={pickerStyles(theme).header}>
          <View>
            <Text style={pickerStyles(theme).headerTitle}>Wybierz {slot.label}</Text>
            {filterNote && (
              <Text style={pickerStyles(theme).filterNote}>
                <Ionicons name="funnel-outline" size={11} color={theme.primary2} /> {filterNote}
              </Text>
            )}
          </View>
          <Pressable style={pickerStyles(theme).closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={18} color={theme.text} />
          </Pressable>
        </View>

        {/* Remove option if slot filled */}
        {current && (
          <Pressable style={pickerStyles(theme).removeRow} onPress={onRemove}>
            <Ionicons name="trash-outline" size={16} color={theme.primary2} />
            <Text style={pickerStyles(theme).removeText}>Usuń wybrany komponent</Text>
          </Pressable>
        )}

        {/* List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 32 }}>
          {available.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: theme.muted, fontSize: 14 }}>Brak kompatybilnych komponentów</Text>
            </View>
          )}
          {available.map((c) => {
            const isSelected = current?.id === c.id;
            const brandColor = BRAND_COLOR[c.brand] ?? theme.primary2;
            return (
              <Pressable
                key={c.id}
                style={[pickerStyles(theme).item, isSelected && { borderColor: theme.primary2, backgroundColor: '#1e1012' }]}
                onPress={() => onSelect(c)}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: brandColor }} />
                    <Text style={{ fontSize: 10, color: theme.muted }}>{c.brand} · {c.generation}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: isSelected ? theme.primary2 : theme.text, marginBottom: 2 }}>
                    {c.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: theme.muted }}>
                    {Object.entries(c.specs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: isSelected ? theme.primary2 : theme.text }}>
                    {c.price.toLocaleString('pl-PL')} zł
                  </Text>
                  {isSelected
                    ? <Ionicons name="checkmark-circle" size={20} color={theme.primary2} />
                    : <Ionicons name="add-circle-outline" size={20} color={theme.muted} />
                  }
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const pickerStyles = (theme: AppTheme) => StyleSheet.create({
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    maxHeight: '75%',
    backgroundColor: theme.background,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderBottomWidth: 0,
    borderColor: theme.borderStrong,
    paddingHorizontal: 18, paddingTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 18,
  },
  handle: {
    width: 38, height: 4, borderRadius: 2,
    backgroundColor: theme.muted, opacity: 0.35,
    alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  headerTitle: { color: theme.text, fontSize: 20, fontWeight: '900' },
  filterNote: { color: theme.primary2, fontSize: 11, marginTop: 3 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.card, borderWidth: 1,
    borderColor: theme.borderStrong,
    justifyContent: 'center', alignItems: 'center',
  },
  removeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1e1012', borderRadius: 12,
    borderWidth: 1, borderColor: '#3a1018',
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  removeText: { color: theme.primary2, fontSize: 13, fontWeight: '700' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.card, borderRadius: 18,
    borderWidth: 1.5, borderColor: theme.borderStrong,
    paddingHorizontal: 14, paddingVertical: 12, gap: 12,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    bottomBar: {
      backgroundColor: theme.card,
      borderTopWidth: 1, borderTopColor: theme.borderStrong,
      paddingHorizontal: 18, paddingVertical: 12,
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceLabel: { color: theme.muted, fontSize: 11 },
    priceValue: { color: theme.primary2, fontSize: 18, fontWeight: '900', marginTop: 2 },
    compatBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.primary, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 12,
      shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45, shadowRadius: 10, elevation: 6,
    },
    compatBtnText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  });
}
