import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Colors, themes, type AppColorScheme } from '@/src/constants/theme';

type ThemePreferenceContextValue = {
  themeMode: AppColorScheme;
  setThemeMode: (themeMode: AppColorScheme) => void;
  colors: typeof Colors.light;
  paperTheme: typeof themes.light;
};

const THEME_STORAGE_KEY = 'grandstay-theme-mode';

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeMode, setThemeModeState] =
    useState<AppColorScheme>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedThemeMode) => {
      if (storedThemeMode === 'light' || storedThemeMode === 'dark') {
        setThemeModeState(storedThemeMode);
      }
    });
  }, []);

  const setThemeMode = (nextThemeMode: AppColorScheme) => {
    setThemeModeState(nextThemeMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeMode);
  };

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      colors: Colors[themeMode],
      paperTheme: themes[themeMode],
    }),
    [themeMode],
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error(
      'useThemePreference must be used within ThemePreferenceProvider',
    );
  }

  return context;
}
