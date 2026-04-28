import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { globalStyles, colors } from '../app/constants/globalStyles';

type NavKey = 'components' | 'threed' | 'home' | 'configs' | 'settings';

type Props = {
  active?: NavKey;
};

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

function NavItem({ icon, label, active = false }: NavItemProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          globalStyles.navItem,
          active && globalStyles.navItemActive,
          { transform: [{ scale }] },
        ]}
      >
        {icon}
        {!active && <Text style={globalStyles.navLabel}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export default function DummyBottomNav({ active = 'home' }: Props) {
  return (
    <View style={globalStyles.bottomNavWrapper}>
      <View style={globalStyles.bottomNav}>
        <NavItem
          active={active === 'components'}
          label="Komponenty"
          icon={<MaterialCommunityIcons name="chip" size={22} color={colors.textDark} />}
        />

        <NavItem
          active={active === 'threed'}
          label="3D"
          icon={<Text style={globalStyles.nav3dText}>3D</Text>}
        />

        <NavItem
          active={active === 'home'}
          label="Home"
          icon={
            <Ionicons
              name="arrow-up"
              size={28}
              color={colors.white}
            />
          }
        />

        <NavItem
          active={active === 'configs'}
          label="Zestawy"
          icon={<MaterialCommunityIcons name="monitor-dashboard" size={22} color={colors.textDark} />}
        />

        <NavItem
          active={active === 'settings'}
          label="Profil"
          icon={<Ionicons name="person-outline" size={22} color={colors.textDark} />}
        />
      </View>
    </View>
  );
}