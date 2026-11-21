// components/CustomAlert.tsx

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
  icon?: string;
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
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config) {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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

  // Auto-resolve icon from title
  const resolveIcon = (): { name: string; color: string } => {
    if (config.icon) return { name: config.icon, color: config.iconColor ?? theme.primary2 };
    const t = config.title.toLowerCase();
    if (t.includes('usuń') || t.includes('błąd'))   return { name: 'trash-outline',            color: '#E83040' };
    if (t.includes('zapisane') || t.includes('ok'))  return { name: 'checkmark-circle-outline', color: '#2EC27E' };
    if (t.includes('limit') || t.includes('mało'))   return { name: 'warning-outline',          color: '#FFD100' };
    if (t.includes('wróć') || t.includes('powrót'))  return { name: 'save-outline',             color: theme.primary2 };
    return { name: 'information-circle-outline', color: theme.primary2 };
  };

  const { name: iconName, color: iconColor } = resolveIcon();
  const isSingle = config.buttons.length === 1;

  return (
    <Modal transparent animationType="none" onRequestClose={onDismiss}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>

      {/* Center overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderStrong,
              shadowColor: '#000',
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={iconName as any} size={30} color={iconColor} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text }]}>{config.title}</Text>

          {/* Message */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {config.message}
          </Text>

          {/* Separator */}
          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          {/* Buttons */}
          {isSingle ? (
            // Single button — full width
            <Pressable
              style={({ pressed }) => [
                styles.btnSingle,
                pressed && { opacity: 0.7 },
              ]}
              onPress={config.buttons[0].onPress}
            >
              <Text style={[
                styles.btnText,
                { color: config.buttons[0].style === 'destructive' ? '#E83040' : theme.primary2 },
              ]}>
                {config.buttons[0].text}
              </Text>
            </Pressable>
          ) : (
            // Multiple buttons — row
            <View style={styles.btnRow}>
              {config.buttons.map((btn, i) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel      = btn.style === 'cancel';
                const btnColor      = isDestructive ? '#E83040' : isCancel ? theme.muted : theme.primary2;
                const isLast        = i === config.buttons.length - 1;

                return (
                  <React.Fragment key={i}>
                    {i > 0 && (
                      <View style={[styles.btnDividerV, { backgroundColor: theme.border }]} />
                    )}
                    <Pressable
                      style={({ pressed }) => [
                        styles.btn,
                        i === 0 && styles.btnLeft,
                        isLast && styles.btnRight,
                        pressed && { opacity: 0.65 },
                      ]}
                      onPress={btn.onPress}
                    >
                      <Text style={[
                        styles.btnText,
                        { color: btnColor, fontWeight: isCancel ? '600' : '800' },
                      ]}>
                        {btn.text}
                      </Text>
                    </Pressable>
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  dialog: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 26,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  separator: {
    height: 1,
    width: '100%',
  },
  // Single button
  btnSingle: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Multi button row
  btnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLeft: {
    // no extra radius — dialog overflow:hidden handles it
  },
  btnRight: {
    // no extra radius
  },
  btnDividerV: {
    width: 1,
  },
  btnText: {
    fontSize: 15,
    letterSpacing: 0.1,
    fontWeight: '800',
  },
});