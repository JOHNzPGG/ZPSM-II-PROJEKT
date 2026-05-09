import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'pcua_theme';
const ACCENT_STORAGE_KEY = 'pcua_accent';

export type ThemeName = 'dark' | 'light';
export type AccentName = 'red' | 'blue' | 'green' | 'purple' | 'orange';

export type AppTheme = {
  name: ThemeName;
  accent: AccentName;
  background: string;
  background2: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;
  primary: string;
  primary2: string;
  primaryGlow: string;
  nav: string;
  nav2: string;
  card: string;
  glass: string;
  text: string;
  textDark: string;
  textSecondary: string;
  muted: string;
  border: string;
  borderStrong: string;
  white: string;
  black: string;
  shadow: string;
  shadowLight: string;
  neuShadowDark: string;
  neuShadowLight: string;
};

// Accent palettes
const accents: Record<AccentName, { primary: string; primary2: string; primaryGlow: string; nav: string; nav2: string }> = {
  red: {
    primary: '#C0202A',
    primary2: '#E83040',
    primaryGlow: 'rgba(232,48,64,0.35)',
    nav: '#8B1520',
    nav2: '#C0202A',
  },
  blue: {
    primary: '#1A5FB4',
    primary2: '#3584E4',
    primaryGlow: 'rgba(53,132,228,0.35)',
    nav: '#1A3A6E',
    nav2: '#1A5FB4',
  },
  green: {
    primary: '#1B6B3A',
    primary2: '#2EC27E',
    primaryGlow: 'rgba(46,194,126,0.35)',
    nav: '#14502B',
    nav2: '#1B6B3A',
  },
  purple: {
    primary: '#5B3A9E',
    primary2: '#9141AC',
    primaryGlow: 'rgba(145,65,172,0.35)',
    nav: '#3D2570',
    nav2: '#5B3A9E',
  },
  orange: {
    primary: '#C45A00',
    primary2: '#E8720C',
    primaryGlow: 'rgba(232,114,12,0.35)',
    nav: '#8B3D00',
    nav2: '#C45A00',
  },
};

function buildDarkTheme(accent: AccentName): AppTheme {
  const a = accents[accent];
  return {
    name: 'dark',
    accent,
    background: '#1A1C1E',
    background2: '#141618',
    surface: '#202325',
    surfaceRaised: '#262A2D',
    surfaceSunken: '#141618',
    primary: a.primary,
    primary2: a.primary2,
    primaryGlow: a.primaryGlow,
    nav: a.nav,
    nav2: a.nav2,
    card: '#242729',
    glass: 'rgba(255,255,255,0.05)',
    text: '#F0F0F0',
    textDark: '#F0F0F0',
    textSecondary: '#A0A8B0',
    muted: '#6A7280',
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.14)',
    white: '#FFFFFF',
    black: '#0D0F10',
    shadow: '#000000',
    shadowLight: 'rgba(255,255,255,0.04)',
    neuShadowDark: 'rgba(0,0,0,0.55)',
    neuShadowLight: 'rgba(255,255,255,0.05)',
  };
}

function buildLightTheme(accent: AccentName): AppTheme {
  const a = accents[accent];
  return {
    name: 'light',
    accent,
    background: '#E8EAED',
    background2: '#D8DCE2',
    surface: '#E8EAED',
    surfaceRaised: '#F2F4F7',
    surfaceSunken: '#D8DCE2',
    primary: a.primary,
    primary2: a.primary2,
    primaryGlow: a.primaryGlow,
    nav: a.nav,
    nav2: a.nav2,
    card: '#ECEEF1',
    glass: 'rgba(255,255,255,0.72)',
    text: '#1A1C1E',
    textDark: '#1A1C1E',
    textSecondary: '#4A5260',
    muted: '#6A7280',
    border: 'rgba(0,0,0,0.07)',
    borderStrong: 'rgba(0,0,0,0.14)',
    white: '#FFFFFF',
    black: '#0D0F10',
    shadow: '#000000',
    shadowLight: 'rgba(255,255,255,0.80)',
    neuShadowDark: 'rgba(0,0,0,0.18)',
    neuShadowLight: 'rgba(255,255,255,0.85)',
  };
}

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  accentName: AccentName;
  toggleTheme: () => Promise<void>;
  setAccent: (accent: AccentName) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');
  const [accentName, setAccentName] = useState<AccentName>('red');

  useEffect(() => {
    const load = async () => {
      const [savedTheme, savedAccent] = await Promise.all([
        AsyncStorage.getItem(THEME_STORAGE_KEY),
        AsyncStorage.getItem(ACCENT_STORAGE_KEY),
      ]);
      if (savedTheme === 'dark' || savedTheme === 'light') setThemeName(savedTheme);
      if (savedAccent && savedAccent in accents) setAccentName(savedAccent as AccentName);
    };
    load();
  }, []);

  const toggleTheme = async () => {
    const next: ThemeName = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(next);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  };

  const setAccent = async (accent: AccentName) => {
    setAccentName(accent);
    await AsyncStorage.setItem(ACCENT_STORAGE_KEY, accent);
  };

  const theme = useMemo(
    () => (themeName === 'dark' ? buildDarkTheme(accentName) : buildLightTheme(accentName)),
    [themeName, accentName],
  );

  const value = useMemo(
    () => ({ theme, themeName, accentName, toggleTheme, setAccent }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme musi być użyte wewnątrz AppThemeProvider.');
  return context;
}
