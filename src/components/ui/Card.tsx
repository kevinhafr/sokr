import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'premium' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  glow = false,
  style,
  children,
  ...props
}: CardProps) {
  const styles = useThemedStyles(createStyles);
  
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        padding !== 'none' && styles[`padding_${padding}`],
        glow && styles.glow,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  base: {
    backgroundColor: GameTheme.colors.card,
    borderRadius: GameTheme.borderRadius.card,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: GameTheme.colors.border,
  },
  elevated: {
    ...GameTheme.shadows.card,
    backgroundColor: GameTheme.colors.surface,
  },
  outlined: {
    borderWidth: 1,
    borderColor: GameTheme.colors.border,
    backgroundColor: 'transparent',
  },
  premium: {
    ...GameTheme.shadows.xl,
    backgroundColor: GameTheme.colors.card,
    borderWidth: 2,
    borderColor: GameTheme.colors.secondary,
  },
  glass: {
    backgroundColor: 'rgba(30, 36, 68, 0.9)',
    borderRadius: GameTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...GameTheme.shadows.lg,
  },
  
  // Padding
  padding_sm: {
    padding: GameTheme.spacing.sm,
  },
  padding_md: {
    padding: GameTheme.spacing.md,
  },
  padding_lg: {
    padding: GameTheme.spacing.lg,
  },
  
  // Glow effect
  glow: {
    shadowColor: GameTheme.colors.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
});