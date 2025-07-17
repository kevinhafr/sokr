import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';
import { Typography } from './Typography';

interface GradientButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'premium' | 'danger' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  gradient?: string[];
  glow?: boolean;
  icon?: React.ReactNode;
}

export function GradientButton({
  title,
  variant = 'primary',
  size = 'md',
  gradient,
  glow = false,
  icon,
  style,
  disabled,
  ...props
}: GradientButtonProps) {
  const styles = useThemedStyles(createStyles);
  
  const getGradient = () => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'premium':
        return GameTheme.gradients.secondary.colors;
      case 'danger':
        return [GameTheme.colors.danger, GameTheme.colors.danger];
      default:
        return GameTheme.gradients.primary.colors;
    }
  };
  
  const getGradientConfig = () => {
    switch (variant) {
      case 'premium':
        return GameTheme.gradients.secondary;
      case 'danger':
        return { colors: [GameTheme.colors.danger, GameTheme.colors.danger], start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
      default:
        return GameTheme.gradients.primary;
    }
  };
  
  const gradientConfig = getGradientConfig();
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[`size_${size}`],
        glow && styles.glow,
        disabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={disabled}
      {...props}
    >
      <LinearGradient
        colors={getGradient()}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={[styles.gradient, styles[`size_${size}`]]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Typography 
          variant={size === 'lg' ? 'buttonLarge' : 'buttonMedium'}
          color="#0A0E27"
          style={styles.text}
        >
          {title}
        </Typography>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  container: {
    borderRadius: GameTheme.borderRadius.button,
    overflow: 'hidden',
    ...GameTheme.shadows.lg,
  },
  gradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: GameTheme.spacing.sm,
  },
  text: {
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  icon: {
    marginRight: GameTheme.spacing.xs,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: GameTheme.spacing.md,
    paddingVertical: GameTheme.spacing.sm,
  },
  size_md: {
    paddingHorizontal: GameTheme.spacing.lg,
    paddingVertical: GameTheme.spacing.md,
  },
  size_lg: {
    paddingHorizontal: GameTheme.spacing.xl,
    paddingVertical: GameTheme.spacing.lg,
  },
  
  // Effects
  glow: {
    ...GameTheme.shadows.glow,
  },
  disabled: {
    opacity: 0.6,
  },
});