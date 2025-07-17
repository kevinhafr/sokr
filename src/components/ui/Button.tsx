import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { GameTheme } from '@/styles';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  icon,
  ...props
}: ButtonProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: GameTheme.colors.primary,
          ...GameTheme.shadows.md,
        };
      case 'secondary':
        return {
          backgroundColor: GameTheme.colors.secondary,
          ...GameTheme.shadows.md,
        };
      case 'destructive':
        return {
          backgroundColor: GameTheme.colors.danger,
          ...GameTheme.shadows.md,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: GameTheme.colors.border,
        };
      case 'premium':
        return {
          backgroundColor: GameTheme.colors.secondary,
          borderWidth: 2,
          borderColor: GameTheme.colors.secondaryLight,
          ...GameTheme.shadows.lg,
        };
      default:
        return {
          backgroundColor: GameTheme.colors.primary,
          ...GameTheme.shadows.md,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = {
      fontFamily: GameTheme.fonts.heading,
      fontWeight: GameTheme.fontWeights.semibold,
      textAlign: 'center' as const,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: GameTheme.colors.card,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: GameTheme.colors.card,
        };
      case 'destructive':
        return {
          ...baseStyle,
          color: GameTheme.colors.card,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: GameTheme.colors.primary,
        };
      case 'premium':
        return {
          ...baseStyle,
          color: GameTheme.colors.card,
        };
      default:
        return {
          ...baseStyle,
          color: GameTheme.colors.card,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: GameTheme.spacing.md,
          paddingVertical: GameTheme.spacing.sm,
        };
      case 'md':
        return {
          paddingHorizontal: GameTheme.spacing.lg,
          paddingVertical: GameTheme.spacing.md,
        };
      case 'lg':
        return {
          paddingHorizontal: GameTheme.spacing.xl,
          paddingVertical: GameTheme.spacing.lg,
        };
      default:
        return {
          paddingHorizontal: GameTheme.spacing.lg,
          paddingVertical: GameTheme.spacing.md,
        };
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'sm':
        return {
          fontSize: GameTheme.typography.fontSize.sm,
          lineHeight: GameTheme.typography.lineHeight.sm,
        };
      case 'md':
        return {
          fontSize: GameTheme.typography.fontSize.base,
          lineHeight: GameTheme.typography.lineHeight.base,
        };
      case 'lg':
        return {
          fontSize: GameTheme.typography.fontSize.lg,
          lineHeight: GameTheme.typography.lineHeight.lg,
        };
      default:
        return {
          fontSize: GameTheme.typography.fontSize.base,
          lineHeight: GameTheme.typography.lineHeight.base,
        };
    }
  };

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: GameTheme.borderRadius.button,
    gap: GameTheme.spacing.xs,
  };

  const buttonStyle: ViewStyle[] = [
    baseStyle,
    getVariantStyle(),
    getSizeStyle(),
    disabled && { opacity: 0.6 },
    style as ViewStyle,
  ];

  const textStyle: TextStyle[] = [
    getTextStyle(),
    getTextSizeStyle(),
  ];

  const getLoadingColor = () => {
    switch (variant) {
      case 'ghost':
        return GameTheme.colors.primary;
      default:
        return GameTheme.colors.card;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor()} />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}