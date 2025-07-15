import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';
import { Typography } from './Typography';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'premium' | 'rarity';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  glow?: boolean;
  children: React.ReactNode;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function Badge({
  variant = 'default',
  size = 'md',
  glow = false,
  rarity,
  style,
  children,
  ...props
}: BadgeProps) {
  const styles = useThemedStyles(createStyles);
  
  // Si une rareté est spécifiée, override la variante
  const actualVariant = rarity ? 'rarity' : variant;
  
  const getTextVariant = () => {
    switch (size) {
      case 'sm': return 'caption';
      case 'lg': return 'label';
      default: return 'caption';
    }
  };
  
  const getTextColor = () => {
    if (rarity) {
      return GameTheme.colors[`rarity${rarity.charAt(0).toUpperCase() + rarity.slice(1)}` as keyof typeof GameTheme.colors];
    }
    
    switch (variant) {
      case 'success': return GameTheme.colors.success;
      case 'warning': return GameTheme.colors.warning;
      case 'danger': return GameTheme.colors.danger;
      case 'premium': return '#0A0E27';
      default: return GameTheme.colors.text;
    }
  };
  
  return (
    <View
      style={[
        styles.base,
        styles[actualVariant],
        styles[`size_${size}`],
        rarity && styles[`rarity_${rarity}`],
        (glow || rarity === 'legendary') && styles.glow,
        style,
      ]}
      {...props}
    >
      <Typography 
        variant={getTextVariant()} 
        color={getTextColor()}
        style={styles.text}
      >
        {children}
      </Typography>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  base: {
    borderRadius: GameTheme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row' as const,
  },
  
  // Text
  text: {
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  
  // Variants
  default: {
    backgroundColor: GameTheme.colors.surface,
    borderWidth: 1,
    borderColor: GameTheme.colors.border,
  },
  success: {
    backgroundColor: GameTheme.colors.success,
  },
  warning: {
    backgroundColor: GameTheme.colors.warning,
  },
  danger: {
    backgroundColor: GameTheme.colors.danger,
  },
  premium: {
    backgroundColor: GameTheme.colors.secondary,
    borderWidth: 1,
    borderColor: GameTheme.colors.secondaryLight,
  },
  rarity: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  
  // Rarity specific styles
  rarity_common: {
    borderColor: GameTheme.colors.rarityCommon,
  },
  rarity_rare: {
    borderColor: GameTheme.colors.rarityRare,
  },
  rarity_epic: {
    borderColor: GameTheme.colors.rarityEpic,
  },
  rarity_legendary: {
    borderColor: GameTheme.colors.rarityLegendary,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: GameTheme.spacing.xs,
    paddingVertical: 2,
    minHeight: 20,
  },
  size_md: {
    paddingHorizontal: GameTheme.spacing.sm,
    paddingVertical: GameTheme.spacing.xxs,
    minHeight: 28,
  },
  size_lg: {
    paddingHorizontal: GameTheme.spacing.md,
    paddingVertical: GameTheme.spacing.xs,
    minHeight: 36,
  },
  
  // Effects
  glow: {
    ...GameTheme.shadows.glow,
  },
});