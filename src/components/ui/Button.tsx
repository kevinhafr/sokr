import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/contexts/ThemeContext';
import { GameTheme, ComponentStyles } from '@/styles';

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
  const styles = useThemedStyles(createStyles);
  const theme = useTheme();
  
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style as ViewStyle,
  ];
  
  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`size_${size}_text`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={styles[`${variant}Text`]?.color || theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: theme.theme.radius.lg,
    ...theme.theme.shadows.sm,
  },
  
  // Variants
  default: {
    backgroundColor: theme.colors.primary,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  destructive: {
    backgroundColor: theme.colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  premium: {
    backgroundColor: GameTheme.colors.secondary,
    borderWidth: 2,
    borderColor: GameTheme.colors.secondaryLight,
    ...GameTheme.shadows.lg,
  },
  
  // Text variants
  text: {
    fontWeight: '600',
  },
  defaultText: {
    ...GameTheme.typography.ui.buttonMedium,
    color: '#0A0E27',
    ...GameTheme.textShadows.subtle,
  },
  primaryText: {
    ...GameTheme.typography.ui.buttonMedium,
    color: '#0A0E27',
    ...GameTheme.textShadows.subtle,
  },
  secondaryText: {
    ...GameTheme.typography.ui.buttonMedium,
    color: '#0A0E27',
  },
  destructiveText: {
    ...GameTheme.typography.ui.buttonMedium,
    color: '#FFFFFF',
  },
  ghostText: {
    ...GameTheme.typography.ui.buttonSmall,
    color: theme.colors.primary,
  },
  premiumText: {
    ...GameTheme.typography.ui.buttonLarge,
    color: '#0A0E27',
    ...GameTheme.textShadows.depth,
  },
  
  // Sizes
  size_sm: {
    paddingHorizontal: theme.theme.spacing.md,
    paddingVertical: theme.theme.spacing.sm,
  },
  size_md: {
    paddingHorizontal: theme.theme.spacing.lg,
    paddingVertical: theme.theme.spacing.md,
  },
  size_lg: {
    paddingHorizontal: theme.theme.spacing.xl,
    paddingVertical: theme.theme.spacing.lg,
  },
  
  // Text sizes
  size_sm_text: {
    fontSize: theme.theme.typography.fontSize.sm,
  },
  size_md_text: {
    fontSize: theme.theme.typography.fontSize.base,
  },
  size_lg_text: {
    fontSize: theme.theme.typography.fontSize.lg,
  },
  
  disabled: {
    opacity: 0.6,
  },
});