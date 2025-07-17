import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  glow?: boolean;
  border?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  intensity = 40,
  tint = 'dark',
  glow = false,
  border = true,
  style,
  children,
  ...props
}: GlassCardProps) {
  const styles = useThemedStyles(createStyles);
  
  return (
    <View
      style={[
        styles.container,
        glow && styles.glow,
        border && styles.border,
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        style={styles.blurView}
      >
        <View style={styles.content}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const createStyles = (theme: typeof GameTheme) => StyleSheet.create({
  container: {
    borderRadius: GameTheme.borderRadius.lg,
    overflow: 'hidden' as const,
    backgroundColor: 'rgba(30, 36, 68, 0.4)',
    ...GameTheme.shadows.lg,
  },
  blurView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: GameTheme.spacing.lg,
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glow: {
    ...GameTheme.shadows.glow,
  },
});