import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, ViewProps } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { GameTheme } from '@/styles';
import { AnimationDurations } from '@/styles/constants';

interface AnimatedCardProps extends ViewProps {
  variant?: 'flip' | 'tilt' | 'float' | 'pulse';
  autoAnimate?: boolean;
  onFlip?: () => void;
  children: React.ReactNode;
  backContent?: React.ReactNode;
}

export function AnimatedCard({
  variant = 'tilt',
  autoAnimate = false,
  onFlip,
  children,
  backContent,
  style,
  ...props
}: AnimatedCardProps) {
  const styles = useThemedStyles(createStyles);
  
  // Animation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const flipAnimation = useRef(new Animated.Value(0)).current;
  
  // Pan responder for tilt effect
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => variant === 'tilt',
      onMoveShouldSetPanResponder: () => variant === 'tilt',
      onPanResponderMove: (evt, gestureState) => {
        if (variant === 'tilt') {
          const xPercentage = gestureState.moveX / 400;
          const yPercentage = gestureState.moveY / 400;
          
          Animated.parallel([
            Animated.spring(rotateY, {
              toValue: (xPercentage - 0.5) * 20,
              useNativeDriver: true,
            }),
            Animated.spring(rotateX, {
              toValue: -(yPercentage - 0.5) * 20,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      onPanResponderRelease: () => {
        if (variant === 'tilt') {
          Animated.parallel([
            Animated.spring(rotateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(rotateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;
  
  useEffect(() => {
    if (autoAnimate) {
      switch (variant) {
        case 'float':
          startFloatAnimation();
          break;
        case 'pulse':
          startPulseAnimation();
          break;
      }
    }
  }, [autoAnimate, variant]);
  
  const startFloatAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: flipAnimation._value === 0 ? 1 : 0,
      duration: AnimationDurations.normal,
      useNativeDriver: true,
    }).start(() => {
      onFlip?.();
    });
  };
  
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  
  const getAnimatedStyle = () => {
    const baseTransform = [
      { perspective: 1000 },
      { translateY },
      { scale },
    ];
    
    switch (variant) {
      case 'tilt':
        return {
          transform: [
            ...baseTransform,
            { rotateX: rotateX.interpolate({
              inputRange: [-20, 20],
              outputRange: ['-20deg', '20deg'],
            })},
            { rotateY: rotateY.interpolate({
              inputRange: [-20, 20],
              outputRange: ['-20deg', '20deg'],
            })},
          ],
        };
      case 'flip':
        return {
          transform: [
            ...baseTransform,
            { rotateY: frontInterpolate },
          ],
          backfaceVisibility: 'hidden' as const,
        };
      default:
        return {
          transform: baseTransform,
        };
    }
  };
  
  const renderContent = () => {
    if (variant === 'flip' && backContent) {
      return (
        <>
          <Animated.View
            style={[
              styles.flipCard,
              getAnimatedStyle(),
              style,
            ]}
          >
            {children}
          </Animated.View>
          <Animated.View
            style={[
              styles.flipCard,
              styles.flipCardBack,
              {
                transform: [
                  { perspective: 1000 },
                  { rotateY: backInterpolate },
                ],
              },
              style,
            ]}
          >
            {backContent}
          </Animated.View>
        </>
      );
    }
    
    return (
      <Animated.View
        style={[
          styles.card,
          getAnimatedStyle(),
          style,
        ]}
        {...(variant === 'tilt' ? panResponder.panHandlers : {})}
        {...props}
      >
        {children}
      </Animated.View>
    );
  };
  
  return renderContent();
}

const createStyles = (theme: ReturnType<typeof import('@/hooks/useThemedStyles').useTheme>) => ({
  card: {
    backgroundColor: GameTheme.colors.card,
    borderRadius: GameTheme.borderRadius.lg,
    padding: GameTheme.spacing.lg,
    ...GameTheme.shadows.lg,
  },
  flipCard: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backgroundColor: GameTheme.colors.card,
    borderRadius: GameTheme.borderRadius.lg,
    padding: GameTheme.spacing.lg,
    ...GameTheme.shadows.lg,
    backfaceVisibility: 'hidden' as const,
  },
  flipCardBack: {
    backgroundColor: GameTheme.colors.surface,
  },
});