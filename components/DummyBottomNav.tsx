import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

export type NavKey = 'components' | 'threed' | 'home' | 'configs' | 'profile';

// Całkowita wysokość navbara + padding — tyle musi zjechać żeby zniknąć
const NAV_TOTAL_H = 110;

type Props = {
  active: NavKey;
  onChange: (key: NavKey) => void;
  hidden?: boolean; // true = zjedź w dół i zniknij
};

type NavItemProps = {
  id: NavKey;
  label: string;
  active: boolean;
  onPress: (key: NavKey) => void;
  icon: ReactNode;
  activeIcon: ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
};

function NavItem({ id, label, active, onPress, icon, activeIcon, styles, theme }: NavItemProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.88, friction: 6, tension: 120, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={() => onPress(id)}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={styles.pressable}
    >
      <Animated.View style={[active ? styles.activeItem : styles.inactiveItem, { transform: [{ scale }] }]}>
        {active ? activeIcon : icon}
        {!active && <Text style={styles.label}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export default function DummyBottomNav({ active, onChange, hidden = false }: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const slideY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideY, {
      toValue: hidden ? NAV_TOTAL_H : 0,
      duration: 320,
      easing: hidden ? Easing.in(Easing.cubic) : Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [hidden]);

  const items: Array<{ id: NavKey; label: string; icon: ReactNode; activeIcon: ReactNode }> = [
    {
      id: 'components',
      label: 'Części',
      icon: <MaterialCommunityIcons name="chip" size={20} color={theme.muted} />,
      activeIcon: <MaterialCommunityIcons name="chip" size={24} color={theme.primary2} />,
    },
    {
      id: 'threed',
      label: '3D',
      icon: <Text style={styles.text3d}>3D</Text>,
      activeIcon: <Text style={[styles.text3d, { color: theme.primary2, fontSize: 16 }]}>3D</Text>,
    },
    {
      id: 'home',
      label: 'Start',
      icon: <Ionicons name="home-outline" size={22} color={theme.muted} />,
      activeIcon: <Ionicons name="home" size={24} color={theme.primary2} />,
    },
    {
      id: 'configs',
      label: 'Zestawy',
      icon: <MaterialCommunityIcons name="monitor-dashboard" size={20} color={theme.muted} />,
      activeIcon: <MaterialCommunityIcons name="monitor-dashboard" size={24} color={theme.primary2} />,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: <Ionicons name="person-outline" size={20} color={theme.muted} />,
      activeIcon: <Ionicons name="person" size={24} color={theme.primary2} />,
    },
  ];

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ translateY: slideY }] }]}>
      <View style={styles.nav}>
        {items.map((item) => (
          <NavItem
            key={item.id}
            {...item}
            active={active === item.id}
            onPress={onChange}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function createStyles(theme: AppTheme) {
  const isLight = theme.name === 'light';
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 14,
      paddingBottom: 16,
    },
    nav: {
      height: 76,
      backgroundColor: theme.card,
      borderRadius: 26,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      shadowColor: theme.neuShadowDark,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: isLight ? 0.18 : 0.6,
      shadowRadius: 14,
      elevation: 14,
    },
    pressable: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    activeItem: {
      width: 52,
      height: 52,
      borderRadius: 18,
      backgroundColor: theme.surfaceSunken,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.primary2,
      shadowColor: theme.primary2,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    inactiveItem: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4 },
    label: { color: theme.muted, fontSize: 10, fontWeight: '600' },
    text3d: { fontSize: 14, fontWeight: '900', color: theme.muted },
  });
}
