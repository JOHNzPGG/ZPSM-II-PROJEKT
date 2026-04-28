import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppTheme, useAppTheme } from '../contexts/AppThemeContext';

export type NavKey = 'components' | 'threed' | 'home' | 'configs' | 'profile';

type Props = {
  active: NavKey;
  onChange: (key: NavKey) => void;
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

function NavItem({
  id,
  label,
  active,
  onPress,
  icon,
  activeIcon,
  styles,
  theme,
}: NavItemProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(translateY, {
        toValue: active ? -4 : 2,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={() => onPress(id)}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          active ? styles.navItemActiveShell : styles.navItem,
          {
            transform: [{ scale }, { translateY }],
          },
        ]}
      >
        {active ? (
          <LinearGradient
            colors={[theme.black, theme.primary]}
            style={styles.activeGradient}
          >
            {activeIcon}
          </LinearGradient>
        ) : (
          <>
            {icon}
            <Text style={styles.navLabel}>{label}</Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

export default function DummyBottomNav({ active, onChange }: Props) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[theme.nav2, theme.nav]}
        style={styles.nav}
      >
        <NavItem
          id="components"
          label="Części"
          active={active === 'components'}
          onPress={onChange}
          styles={styles}
          theme={theme}
          icon={<MaterialCommunityIcons name="chip" size={22} color={theme.textDark} />}
          activeIcon={<MaterialCommunityIcons name="chip" size={26} color={theme.white} />}
        />

        <NavItem
          id="threed"
          label="3D"
          active={active === 'threed'}
          onPress={onChange}
          styles={styles}
          theme={theme}
          icon={<Text style={styles.nav3dText}>3D</Text>}
          activeIcon={<Text style={styles.nav3dActiveText}>3D</Text>}
        />

        <NavItem
          id="home"
          label="Start"
          active={active === 'home'}
          onPress={onChange}
          styles={styles}
          theme={theme}
          icon={<Ionicons name="arrow-up-circle-outline" size={25} color={theme.textDark} />}
          activeIcon={<Ionicons name="arrow-up" size={30} color={theme.white} />}
        />

        <NavItem
          id="configs"
          label="Zestawy"
          active={active === 'configs'}
          onPress={onChange}
          styles={styles}
          theme={theme}
          icon={<MaterialCommunityIcons name="monitor-dashboard" size={22} color={theme.textDark} />}
          activeIcon={<MaterialCommunityIcons name="monitor-dashboard" size={27} color={theme.white} />}
        />

        <NavItem
          id="profile"
          label="Profil"
          active={active === 'profile'}
          onPress={onChange}
          styles={styles}
          theme={theme}
          icon={<Ionicons name="person-outline" size={22} color={theme.textDark} />}
          activeIcon={<Ionicons name="person" size={27} color={theme.white} />}
        />
      </LinearGradient>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    nav: {
      height: 82,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.28)',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: 10,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 22,
      elevation: 12,
    },
    pressable: {
      width: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navItem: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navItemActiveShell: {
      width: 68,
      height: 68,
      borderRadius: 34,
      marginTop: -28,
      backgroundColor: theme.black,
      borderWidth: 4,
      borderColor: theme.white,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.24,
      shadowRadius: 14,
      elevation: 12,
      overflow: 'hidden',
    },
    activeGradient: {
      flex: 1,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    navLabel: {
      display: 'none',
    },
    nav3dText: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.textDark,
    },
    nav3dActiveText: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.white,
    },
  });
}