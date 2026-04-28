import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'pcua_theme';

export type ThemeName = 'dark' | 'light';

export type AppTheme = {
  name: ThemeName;
  background: string;
  background2: string;
  primary: string;
  primary2: string;
  nav: string;
  nav2: string;
  card: string;
  glass: string;
  text: string;
  textDark: string;
  muted: string;
  border: string;
  white: string;
  black: string;
  shadow: string;
};

const darkTheme: AppTheme = {
  name: 'dark',
  background: '#22263A',
  background2: '#8C8FB4',
  primary: '#A61D1D',
  primary2: '#E23636',
  nav: '#7F1111',
  nav2: '#C82020',
  card: '#F6F7FB',
  glass: 'rgba(255,255,255,0.14)',
  text: '#FFFFFF',
  textDark: '#151823',
  muted: '#C9CEE3',
  border: 'rgba(255,255,255,0.22)',
  white: '#FFFFFF',
  black: '#0E1018',
  shadow: '#000000',
};

const lightTheme: AppTheme = {
  name: 'light',
  background: '#ECEEF8',
  background2: '#C7CCE3',
  primary: '#A61D1D',
  primary2: '#E23636',
  nav: '#8E1515',
  nav2: '#D72D2D',
  card: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  text: '#151823',
  textDark: '#151823',
  muted: '#68708A',
  border: 'rgba(20,25,40,0.12)',
  white: '#FFFFFF',
  black: '#0E1018',
  shadow: '#000000',
};

const themes = {
  dark: darkTheme,
  light: lightTheme,
};

type ThemeContextValue = {
  theme: AppTheme;
  themeName: ThemeName;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeName(savedTheme);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme: ThemeName = themeName === 'dark' ? 'light' : 'dark';
    setThemeName(nextTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  const value = useMemo(
    () => ({
      theme: themes[themeName],
      themeName,
      toggleTheme,
    }),
    [themeName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme musi być użyte wewnątrz AppThemeProvider.');
  }

  return context;
}