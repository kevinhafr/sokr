import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';
import { AnimationDurations } from '@/styles/constants';
import { Typography } from './Typography';
import { Icon } from './Icon';

const { width: screenWidth } = Dimensions.get('window');

interface NotificationToastProps {
  visible: boolean;
  type: 'success' | 'error' | 'warning' | 'info' | 'achievement';
  title: string;
  message?: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
  onDismiss?: () => void;
  icon?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function NotificationToast({
  visible,
  type,
  title,
  message,
  duration = 3000,
  position = 'top',
  onDismiss,
  icon,
  action,
}: NotificationToastProps) {
  const styles = useThemedStyles(createStyles);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: AnimationDurations.normal,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: AnimationDurations.fast,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);
  
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'bottom' ? 200 : -200,
        duration: AnimationDurations.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: AnimationDurations.fast,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };
  
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      case 'achievement': return 'trophy';
      default: return 'bell';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'achievement': return '#0A0E27';
      default: return '#FFFFFF';
    }
  };
  
  const getTranslateY = () => {
    return position === 'bottom' ? -slideAnim : slideAnim;
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View
      style={[
        styles.container,
        styles[`position_${position}`],
        styles[`type_${type}`],
        {
          opacity: opacityAnim,
          transform: [
            { translateY: getTranslateY() },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <Icon 
          name={getIcon()} 
          size={24} 
          color={getIconColor()}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          <Typography 
            variant={type === 'achievement' ? 'h4' : 'label'}
            color={type === 'achievement' ? '#0A0E27' : '#FFFFFF'}
          >
            {title}
          </Typography>
          
          {message && (
            <Typography 
              variant="caption" 
              color={type === 'achievement' ? '#0A0E27' : 'rgba(255, 255, 255, 0.8)'}
              style={styles.message}
            >
              {message}
            </Typography>
          )}
        </View>
        
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Typography variant="label" color="#FFFFFF">
              {action.label}
            </Typography>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  container: {
    position: 'absolute' as const,
    left: GameTheme.spacing.lg,
    right: GameTheme.spacing.lg,
    maxWidth: 480,
    alignSelf: 'center' as const,
    ...GameTheme.notifications.base,
  },
  
  // Positions
  position_top: {
    top: GameTheme.spacing.xxl,
  },
  position_bottom: {
    bottom: GameTheme.spacing.xxl,
  },
  position_center: {
    top: '50%',
    transform: [{ translateY: -50 }],
  },
  
  // Types
  type_success: GameTheme.notifications.toast.success,
  type_error: GameTheme.notifications.toast.error,
  type_warning: GameTheme.notifications.toast.warning,
  type_info: GameTheme.notifications.toast.info,
  type_achievement: GameTheme.notifications.toast.achievement,
  
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  icon: {
    marginRight: GameTheme.spacing.md,
  },
  
  textContainer: {
    flex: 1,
  },
  
  message: {
    marginTop: GameTheme.spacing.xxs,
  },
  
  actionButton: {
    marginLeft: GameTheme.spacing.md,
    paddingHorizontal: GameTheme.spacing.md,
    paddingVertical: GameTheme.spacing.xs,
    borderRadius: GameTheme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});