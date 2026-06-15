// components/CustomAlert.tsx
// Niestandardowy alert w stylu aplikacji — zastępuje Alert.alert

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../contexts/AppThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertButton = {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type AlertConfig = {
  title: string;
  message: string;
  icon?: string; // Ionicons name
  iconColor?: string;
  buttons: AlertButton[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomAlert({
  config,
  onDismiss,
}: {
  config: AlertConfig | null;
  onDismiss: () => void;
}) {
  const { theme } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config) {
      scaleAnim.setValue(0.85);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [config]);

  if (!config) return null;

  const isLight = theme.name === 'light';

  // Determine icon + color from title if not provided
  const resolveIcon = (): { name: string; color: string } => {
    if (config.icon) return { name: config.icon, color: config.iconColor ?? theme.primary2 };
    const t = config.title.toLowerCase();
    if (t.includes('usuń') || t.includes('błąd') || t.includes('error'))
      return { name: 'alert-circle', color: '#E83040' };
    if (t.includes('zgoda') || t.includes('kompatybilność') || t.includes('zapisane'))
      return { name: 'checkmark-circle', color: '#2EC27E' };
    if (t.includes('brak') || t.includes('limit'))
      return { name: 'warning', color: '#FFD100' };
    if (t.includes('wróć') || t.includes('powrót'))
      return { name: 'save-outline', color: theme.primary2 };
    return { name: 'information-circle', color: theme.primary2 };
  };

  const { name: iconName, color: iconColor } = resolveIcon();

  return (
    <Modal transparent animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* Dialog */}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderStrong,
              shadowColor: theme.neuShadowDark,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
            <Ionicons name={iconName as any} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{config.title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {config.message}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Buttons */}
          <View style={[
            styles.buttonRow,
            config.buttons.length === 1 && styles.buttonRowSingle,
          ]}>
            {config.buttons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel      = btn.style === 'cancel';
              const isLast        = i === config.buttons.length - 1;

              return (
                <React.Fragment key={i}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.button,
                      config.buttons.length === 1 && styles.buttonFull,
                      isDestructive && { backgroundColor: '#E83040' + '18' },
                      !isDestructive && !isCancel && { backgroundColor: theme.primary2 + '15' },
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => {
                      btn.onPress();
                    }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: isDestructive
                            ? '#E83040'
                            : isCancel
                            ? theme.muted
                            : theme.primary2,
                          fontWeight: isCancel ? '600' : '800',
                        },
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>

                  {/* Vertical divider between buttons */}
                  {!isLast && config.buttons.length > 1 && (
                    <View style={[styles.btnDivider, { backgroundColor: theme.border }]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 0,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  divider: {
    width: '200%',
    height: 1,
    marginBottom: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '200%',
  },
  buttonRowSingle: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  buttonFull: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  buttonText: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  btnDivider: {
    width: 1,
  },
});
