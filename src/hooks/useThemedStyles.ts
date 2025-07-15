import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  styles: (theme: ReturnType<typeof useTheme>) => T
): T {
  const theme = useTheme();
  
  return useMemo(() => {
    return StyleSheet.create(styles(theme));
  }, [theme.colorScheme]);
}