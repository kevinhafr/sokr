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

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
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
        <ActivityIndicator color={styles[`${variant}Text`].color} />
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
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  destructive: {
    backgroundColor: theme.colors.destructive,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Text variants
  text: {
    fontWeight: theme.theme.typography.fontWeight.semibold,
  },
  primaryText: {
    color: theme.colors.primaryForeground,
  },
  secondaryText: {
    color: theme.colors.secondaryForeground,
  },
  destructiveText: {
    color: theme.colors.destructiveForeground,
  },
  ghostText: {
    color: theme.colors.primary,
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