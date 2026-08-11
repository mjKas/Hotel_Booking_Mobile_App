import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

export const Colors = {
  light: {
    primary: '#082A55',
    secondary: '#FCA311',
    background: '#E5E5E5',
    surface: '#FFFFFF',
    surfaceVariant: '#E5E5E5',
    text: '#082A55',
    textPrimary: '#082A55',
    textSecondary: '#000000',
    border: '#E5E5E5',
    icon: '#082A55',
    tabInactive: '#000000',
    headerText: '#FFFFFF',
    headerSubtle: '#E5E5E5',
    imagePlaceholder: '#E5E5E5',
    success: '#2E7D32',
    successSurface: '#E8F5E9',
    info: '#1976D2',
    infoSurface: '#E3F2FD',
    warning: '#F59E0B',
    error: '#D32F2F',
    errorSurface: '#FFEBEE',
  },
  dark: {
    primary: '#082A55',
    secondary: '#FCA311',
    background: '#000000',
    surface: '#082A55',
    surfaceVariant: '#000000',
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E5E5',
    border: '#E5E5E5',
    icon: '#E5E5E5',
    tabInactive: '#E5E5E5',
    headerText: '#FFFFFF',
    headerSubtle: '#E5E5E5',
    imagePlaceholder: '#082A55',
    success: '#81C784',
    successSurface: '#173823',
    info: '#90CAF9',
    infoSurface: '#17324A',
    warning: '#FFB74D',
    error: '#EF9A9A',
    errorSurface: '#4A1F25',
  },
};

export type AppColorScheme = keyof typeof Colors;
export type AppColors = typeof Colors.light;

export const colors = Colors.light;

export const themes = {
  light: {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: Colors.light.primary,
      secondary: Colors.light.secondary,
      background: Colors.light.background,
      surface: Colors.light.surface,
      surfaceVariant: Colors.light.surfaceVariant,
      onSurface: Colors.light.textPrimary,
      onSurfaceVariant: Colors.light.textSecondary,
      outline: Colors.light.border,
      error: Colors.light.error,
    },
    roundness: 12,
  },
  dark: {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.dark.primary,
      secondary: Colors.dark.secondary,
      background: Colors.dark.background,
      surface: Colors.dark.surface,
      surfaceVariant: Colors.dark.surfaceVariant,
      onSurface: Colors.dark.textPrimary,
      onSurfaceVariant: Colors.dark.textSecondary,
      outline: Colors.dark.border,
      error: Colors.dark.error,
    },
    roundness: 12,
  },
};

export const theme = themes.light;
