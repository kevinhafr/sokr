import { colors, ColorScheme, Colors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} as const;

export type Theme = typeof theme;
export type { ColorScheme, Colors };

// Helper to get theme colors based on scheme
export const getColors = (scheme: ColorScheme): Colors => {
  return colors[scheme];
};