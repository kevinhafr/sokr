import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.theme.radius.lg,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  elevated: {
    ...theme.theme.shadows.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  
  // Padding
  padding_sm: {
    padding: theme.theme.spacing.sm,
  },
  padding_md: {
    padding: theme.theme.spacing.md,
  },
  padding_lg: {
    padding: theme.theme.spacing.lg,
  },
});