import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#082A55',
  secondary: '#FCA311',

  background: '#F7F8FA',
  surface: '#FFFFFF',

  textPrimary: '#082A55',
  textSecondary: '#6B7280',

  border: '#E5E5E5',

  success: '#2E7D32',
  warning: '#F59E0B',
  error: '#D32F2F',
};

export const theme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
  },

  roundness: 12,
};