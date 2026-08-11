import { useThemePreference } from '@/src/context/theme-preference';

export function useAppThemeColors() {
  return useThemePreference().colors;
}
