// Custom hooks for managing screen transitions
import { useEffect, useRef, useCallback } from 'react';
import { Animated, BackHandler } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnimationDurations } from '@/styles/constants';
import { Animations } from '@/styles/animations';

// Hook for page enter/exit animations
export function useScreenTransition(
  type: 'fade' | 'slide' | 'scale' | 'custom' = 'fade',
  options?: {
    duration?: number;
    delay?: number;
    onEnterComplete?: () => void;
    onExitComplete?: () => void;
  }
) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  
  const navigation = useNavigation();
  
  // Enter animation
  useEffect(() => {
    const animations = [];
    
    switch (type) {
      case 'fade':
        animations.push(
          Animated.timing(opacity, {
            toValue: 1,
            duration: options?.duration || AnimationDurations.normal,
            delay: options?.delay || 0,
            useNativeDriver: true,
          })
        );
        break;
      
      case 'slide':
        animations.push(
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: options?.duration || AnimationDurations.normal,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              damping: 20,
              stiffness: 300,
              useNativeDriver: true,
            }),
          ])
        );
        break;
      
      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: options?.duration || AnimationDurations.normal,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ])
        );
        break;
    }
    
    Animated.parallel(animations).start(() => {
      options?.onEnterComplete?.();
    });
    
    // Cleanup function for exit animation
    return () => {
      const exitAnimations = [];
      
      switch (type) {
        case 'fade':
          exitAnimations.push(
            Animated.timing(opacity, {
              toValue: 0,
              duration: AnimationDurations.fast,
              useNativeDriver: true,
            })
          );
          break;
        
        case 'slide':
          exitAnimations.push(
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 0,
                duration: AnimationDurations.fast,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 50,
                duration: AnimationDurations.fast,
                useNativeDriver: true,
              }),
            ])
          );
          break;
        
        case 'scale':
          exitAnimations.push(
            Animated.parallel([
              Animated.timing(opacity, {
                toValue: 0,
                duration: AnimationDurations.fast,
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 0.9,
                duration: AnimationDurations.fast,
                useNativeDriver: true,
              }),
            ])
          );
          break;
      }
      
      Animated.parallel(exitAnimations).start(() => {
        options?.onExitComplete?.();
      });
    };
  }, []);
  
  return {
    animatedStyle: {
      opacity,
      transform: [
        { translateY: type === 'slide' ? translateY : 0 },
        { scale: type === 'scale' ? scale : 1 },
      ],
    },
    opacity,
    translateY,
    scale,
  };
}

// Hook for stagger animations on lists
export function useStaggerAnimation(
  itemCount: number,
  options?: {
    staggerDelay?: number;
    itemDuration?: number;
    initialDelay?: number;
  }
) {
  const animations = useRef<Animated.Value[]>([]);
  
  // Initialize animations for each item
  useEffect(() => {
    animations.current = Array(itemCount)
      .fill(0)
      .map(() => new Animated.Value(0));
  }, [itemCount]);
  
  // Start stagger animation
  const startAnimation = useCallback(() => {
    const animationSequence = animations.current.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: options?.itemDuration || AnimationDurations.normal,
        delay: (options?.initialDelay || 0) + index * (options?.staggerDelay || 50),
        useNativeDriver: true,
      })
    );
    
    Animated.parallel(animationSequence).start();
  }, [options]);
  
  // Reset animations
  const resetAnimation = useCallback(() => {
    animations.current.forEach(anim => anim.setValue(0));
  }, []);
  
  // Auto-start on mount
  useEffect(() => {
    startAnimation();
  }, [startAnimation]);
  
  return {
    animations: animations.current,
    startAnimation,
    resetAnimation,
    getItemStyle: (index: number) => ({
      opacity: animations.current[index] || new Animated.Value(0),
      transform: [
        {
          translateY: (animations.current[index] || new Animated.Value(0)).interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    }),
  };
}

// Hook for hero transitions
export function useHeroTransition(heroId: string) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  const measureAndAnimate = useCallback((
    fromLayout: { x: number; y: number; width: number; height: number },
    toLayout: { x: number; y: number; width: number; height: number }
  ) => {
    // Calculate position and scale differences
    const scaleX = toLayout.width / fromLayout.width;
    const scaleY = toLayout.height / fromLayout.height;
    
    position.setValue({ x: fromLayout.x, y: fromLayout.y });
    
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: toLayout.x, y: toLayout.y },
        duration: AnimationDurations.normal,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: Math.min(scaleX, scaleY),
        duration: AnimationDurations.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [position, scale]);
  
  return {
    position,
    scale,
    measureAndAnimate,
    animatedStyle: {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { scale },
      ],
    },
  };
}

// Hook for gesture-based transitions
export function useGestureTransition() {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const gestureState = useRef({ isActive: false }).current;
  
  const navigation = useNavigation();
  
  const onGestureStart = useCallback(() => {
    gestureState.isActive = true;
  }, []);
  
  const onGestureMove = useCallback((dx: number, dy: number) => {
    if (gestureState.isActive) {
      translateX.setValue(dx);
      translateY.setValue(dy);
    }
  }, [translateX, translateY]);
  
  const onGestureEnd = useCallback((velocityX: number, shouldNavigateBack: boolean) => {
    gestureState.isActive = false;
    
    if (shouldNavigateBack && navigation.canGoBack()) {
      Animated.timing(translateX, {
        toValue: 400,
        duration: AnimationDurations.fast,
        useNativeDriver: true,
      }).start(() => {
        navigation.goBack();
      });
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [navigation, translateX, translateY]);
  
  return {
    translateX,
    translateY,
    onGestureStart,
    onGestureMove,
    onGestureEnd,
    animatedStyle: {
      transform: [{ translateX }, { translateY }],
    },
  };
}

// Hook for custom back handler with animation
export function useAnimatedBackHandler(
  onBack?: () => boolean | void,
  exitAnimation?: () => Promise<void>
) {
  const navigation = useNavigation();
  
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', async () => {
        if (onBack) {
          const handled = onBack();
          if (handled === false) {
            return false;
          }
        }
        
        if (exitAnimation) {
          await exitAnimation();
        }
        
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        
        return false;
      });
      
      return () => backHandler.remove();
    }, [onBack, exitAnimation, navigation])
  );
}