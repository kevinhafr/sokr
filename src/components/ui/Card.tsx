import React from 'react';
import { View, ViewProps } from 'react-native';
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
  const getVariantStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: GameTheme.colors.card,
          borderRadius: GameTheme.borderRadius.card,
          borderWidth: 1,
          borderColor: GameTheme.colors.border,
          ...GameTheme.shadows.sm,
        };
      case 'elevated':
        return {
          backgroundColor: GameTheme.colors.card,
          borderRadius: GameTheme.borderRadius.card,
          ...GameTheme.shadows.card,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderRadius: GameTheme.borderRadius.card,
          borderWidth: 1,
          borderColor: GameTheme.colors.border,
        };
      case 'premium':
        return {
          backgroundColor: GameTheme.colors.card,
          borderRadius: GameTheme.borderRadius.card,
          borderWidth: 2,
          borderColor: GameTheme.colors.secondary,
          ...GameTheme.shadows.lg,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: GameTheme.borderRadius.lg,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          ...GameTheme.shadows.md,
        };
      default:
        return {
          backgroundColor: GameTheme.colors.card,
          borderRadius: GameTheme.borderRadius.card,
          ...GameTheme.shadows.sm,
        };
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: GameTheme.spacing.sm };
      case 'md':
        return { padding: GameTheme.spacing.md };
      case 'lg':
        return { padding: GameTheme.spacing.lg };
      default:
        return { padding: GameTheme.spacing.md };
    }
  };

  const getGlowStyle = () => {
    if (!glow) return {};
    return {
      shadowColor: GameTheme.colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    };
  };

  const variantStyle = getVariantStyle();
  const paddingStyle = getPaddingStyle();
  const glowStyle = getGlowStyle();

  return (
    <View
      style={[
        variantStyle,
        paddingStyle,
        glowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}