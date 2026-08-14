import {
  MD3DarkTheme,
  MD3LightTheme,
} from 'react-native-paper';

export const Colors = {
  light: {
    // Brand
    primary: '#082A55',
    secondary: '#FCA311',

    // Backgrounds
    background: '#E5E5E5',
    surface: '#FFFFFF',
    surfaceVariant: '#FFFFFF',

    // Text
    text: '#082A55',
    textPrimary: '#082A55',
    textSecondary: '#000000',

    // TextField
    textFieldBackground: '#FFFFFF',
    textFieldOutline: '#E1E1E1',
    textFieldActiveOutline: '#0B315E',
    textFieldText: '#082A55',
    textFieldPlaceholder: '#000000',

    // UI
    border: '#D0D0D0',
    icon: '#082A55',
    tabInactive: '#000000',

    // Header
    headerText: '#FFFFFF',
    headerSubtle: '#E5E5E5',

    // Other
    imagePlaceholder: '#E5E5E5',

    // Status
    success: '#2E7D32',
    successSurface: '#E8F5E9',

    info: '#1976D2',
    infoSurface: '#E3F2FD',

    warning: '#F59E0B',

    error: '#D32F2F',
    errorSurface: '#FFEBEE',
  },

  dark: {
    // Brand
    primary: '#FCA311',
    secondary: '#FCA311',

    // Backgrounds
    background: '#000000', 
    surface: '#082A55',
    surfaceVariant: '#082A55',

    // Text
    text: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#E5E5E5',

    // TextField
    textFieldBackground: '#082A55',
    textFieldOutline: '#D6E0EC',
    textFieldActiveOutline: '#FFFFFF',
    textFieldText: '#FFFFFF',
    textFieldPlaceholder: '#E5E5E5',

    // UI
    border: '#D6E0EC',
    icon: '#FFFFFF',
    tabInactive: '#E5E5E5',

    // Header
    headerText: '#FFFFFF',
    headerSubtle: '#E5E5E5',

    // Other
    imagePlaceholder: '#082A55',

    // Status
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
      onPrimary: '#FFFFFF',

      secondary: Colors.light.secondary,
      onSecondary: '#082A55',

      background: Colors.light.background,
      surface: Colors.light.surface,
      surfaceVariant: Colors.light.surfaceVariant,

      onSurface: Colors.light.textPrimary,
      onSurfaceVariant: Colors.light.textSecondary,

      outline: Colors.light.textFieldOutline,
      outlineVariant: Colors.light.textFieldOutline,

      error: Colors.light.error,
      onError: '#FFFFFF',
    },

    roundness: 12,
  },

  dark: {
    ...MD3DarkTheme,

    colors: {
      ...MD3DarkTheme.colors,

      primary: Colors.dark.primary,
      onPrimary: '#082A55',

      secondary: Colors.dark.secondary,
      onSecondary: '#082A55',

      background: Colors.dark.background,
      surface: Colors.dark.surface,
      surfaceVariant: Colors.dark.surfaceVariant,

      onSurface: Colors.dark.textPrimary,
      onSurfaceVariant: Colors.dark.textSecondary,

      outline: Colors.dark.textFieldOutline,
      outlineVariant: Colors.dark.textFieldOutline,

      error: Colors.dark.error,
      onError: '#000000',
    },

    roundness: 12,
  },
};

export const theme = themes.light;