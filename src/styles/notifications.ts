// Gaming Notification Styles - Toasts, Alerts, and Popups
import { CoreColors, AnimationDurations } from './constants';
import { AdvancedShadows, GlowEffects } from './effects';
import { Gradients } from './gradients';
import { Typography } from './typography';

// We'll need these spacing values locally to avoid circular dependency
const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 999,
  card: 12,
  button: 8,
};

export const NotificationStyles = {
  // Base notification container
  base: {
    minHeight: 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    ...AdvancedShadows.depth.level3,
  },
  
  // Toast notifications (temporary messages)
  toast: {
    success: {
      backgroundColor: CoreColors.success,
      borderLeftWidth: 4,
      borderLeftColor: CoreColors.primary,
      ...GlowEffects.soft,
    },
    error: {
      backgroundColor: CoreColors.danger,
      borderLeftWidth: 4,
      borderLeftColor: '#CC0000',
    },
    warning: {
      backgroundColor: CoreColors.warning,
      borderLeftWidth: 4,
      borderLeftColor: '#CC8800',
    },
    info: {
      backgroundColor: CoreColors.info,
      borderLeftWidth: 4,
      borderLeftColor: '#0066CC',
    },
    achievement: {
      backgroundColor: CoreColors.secondary,
      borderWidth: 2,
      borderColor: CoreColors.secondaryLight,
      ...GlowEffects.intense,
    },
  },
  
  // Alert dialogs (modal style)
  alert: {
    container: {
      backgroundColor: CoreColors.card,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      minWidth: 300,
      ...AdvancedShadows.depth.level5,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    title: {
      fontFamily: 'BebasNeue',
      fontSize: 28,
      lineHeight: 32,
      letterSpacing: 0.75,
      textTransform: 'uppercase' as const,
      color: CoreColors.text,
      marginBottom: spacing.md,
      textAlign: 'center' as const,
    },
    message: {
      fontFamily: 'Geist',
      fontSize: 16,
      lineHeight: 24,
      color: CoreColors.textSecondary,
      marginBottom: spacing.lg,
      textAlign: 'center' as const,
    },
    buttonContainer: {
      flexDirection: 'row' as const,
      gap: spacing.md,
      justifyContent: 'center' as const,
    },
  },
  
  // Gaming specific notifications
  gaming: {
    levelUp: {
      container: {
        backgroundColor: CoreColors.secondary,
        borderRadius: borderRadius.xxl,
        padding: spacing.xl,
        alignItems: 'center' as const,
        ...GlowEffects.pulse,
      },
      icon: {
        width: 80,
        height: 80,
        marginBottom: spacing.md,
      },
      title: {
        fontFamily: 'BebasNeue',
        fontSize: 36,
        lineHeight: 42,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        color: '#0A0E27',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    },
    
    reward: {
      container: {
        background: Gradients.cardLegendary,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: CoreColors.secondaryLight,
        ...AdvancedShadows.coloredShadows.gold,
      },
      content: {
        alignItems: 'center' as const,
      },
      amount: {
        fontFamily: 'BebasNeue',
        fontSize: 42,
        lineHeight: 42,
        letterSpacing: 2,
        fontSize: 36,
        marginVertical: spacing.md,
      },
    },
    
    matchResult: {
      victory: {
        container: {
          background: Gradients.victory,
          borderRadius: borderRadius.xxl,
          padding: spacing.xxl,
          ...GlowEffects.intense,
        },
        title: {
          fontFamily: 'BebasNeue',
        fontSize: 48,
        lineHeight: 55,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
          color: '#0A0E27',
          textTransform: 'uppercase' as const,
          letterSpacing: 3,
        },
      },
      defeat: {
        container: {
          background: Gradients.defeat,
          borderRadius: borderRadius.xxl,
          padding: spacing.xxl,
        },
        title: {
          fontFamily: 'BebasNeue',
        fontSize: 48,
        lineHeight: 55,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
          color: '#FFFFFF',
          textTransform: 'uppercase' as const,
          opacity: 0.8,
        },
      },
      draw: {
        container: {
          backgroundColor: CoreColors.surface,
          borderRadius: borderRadius.xxl,
          padding: spacing.xxl,
          borderWidth: 2,
          borderColor: CoreColors.border,
        },
        title: {
          fontFamily: 'BebasNeue',
        fontSize: 48,
        lineHeight: 55,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
          color: CoreColors.textMuted,
          textTransform: 'uppercase' as const,
        },
      },
    },
    
    combo: {
      container: {
        backgroundColor: 'transparent',
        alignItems: 'center' as const,
      },
      text: {
        fontFamily: 'BebasNeue',
        fontSize: 56,
        lineHeight: 62,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
        color: CoreColors.primary,
        ...GlowEffects.intense,
      },
      multiplier: {
        fontFamily: 'BebasNeue',
        fontSize: 48,
        lineHeight: 48,
        letterSpacing: 2,
        color: CoreColors.secondary,
        marginTop: spacing.sm,
      },
    },
  },
  
  // Popup notifications (corners/edges)
  popup: {
    corner: {
      position: 'absolute' as const,
      top: spacing.xl,
      right: spacing.lg,
      maxWidth: 320,
      ...AdvancedShadows.floating,
    },
    edge: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      ...AdvancedShadows.depth.level4,
    },
    center: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: [{ translateX: -50 }, { translateY: -50 }],
      ...AdvancedShadows.depth.level5,
    },
  },
  
  // Badge notifications (for icons)
  badge: {
    dot: {
      position: 'absolute' as const,
      top: -4,
      right: -4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: CoreColors.danger,
      borderWidth: 2,
      borderColor: CoreColors.background,
    },
    count: {
      position: 'absolute' as const,
      top: -8,
      right: -8,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: CoreColors.danger,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 4,
      borderWidth: 2,
      borderColor: CoreColors.background,
    },
    countText: {
      fontFamily: 'Geist',
      fontSize: 12,
      lineHeight: 17,
      letterSpacing: 0.2,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
  },
  
  // Animation configurations
  animations: {
    slideIn: {
      from: { translateY: -100, opacity: 0 },
      to: { translateY: 0, opacity: 1 },
      duration: 300,
    },
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 200,
    },
    bounce: {
      from: { scale: 0 },
      to: { scale: 1 },
      duration: 400,
      easing: 'bounce',
    },
    shake: {
      keyframes: [
        { translateX: 0 },
        { translateX: -10 },
        { translateX: 10 },
        { translateX: -10 },
        { translateX: 10 },
        { translateX: 0 },
      ],
      duration: 500,
    },
  },
};

// Helper function to create custom notification style
export const createNotificationStyle = (
  type: 'success' | 'error' | 'warning' | 'info',
  variant: 'toast' | 'alert' | 'popup' = 'toast'
) => {
  const baseStyle = NotificationStyles.base;
  const typeStyle = NotificationStyles[variant][type];
  
  return {
    ...baseStyle,
    ...typeStyle,
  };
};