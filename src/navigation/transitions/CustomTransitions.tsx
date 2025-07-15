// Custom transition components for advanced animations
import React, { useEffect, useRef } from 'react';
import { Animated, View, Dimensions } from 'react-native';
import { AnimationDurations } from '@/styles/constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TransitionWrapperProps {
  children: React.ReactNode;
  type?: 'fade' | 'scale' | 'slide' | 'rotate' | 'custom';
  duration?: number;
  delay?: number;
  onComplete?: () => void;
}

export function TransitionWrapper({
  children,
  type = 'fade',
  duration = AnimationDurations.normal,
  delay = 0,
  onComplete,
}: TransitionWrapperProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start(onComplete);
  }, []);
  
  const getAnimatedStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'scale':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      case 'slide':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'rotate':
        return {
          opacity: animatedValue,
          transform: [
            {
              rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['180deg', '0deg'],
              }),
            },
          ],
        };
      default:
        return { opacity: animatedValue };
    }
  };
  
  return (
    <Animated.View style={[{ flex: 1 }, getAnimatedStyle()]}>
      {children}
    </Animated.View>
  );
}

// Page transition overlay effects
export function TransitionOverlay({
  visible,
  type = 'fade',
  color = GameTheme.colors.background,
  onComplete,
}: {
  visible: boolean;
  type?: 'fade' | 'wipe' | 'circle' | 'split';
  color?: string;
  onComplete?: () => void;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      if (type === 'circle') {
        Animated.timing(circleScale, {
          toValue: 1,
          duration: AnimationDurations.slow,
          useNativeDriver: true,
        }).start(onComplete);
      } else {
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: AnimationDurations.normal,
          useNativeDriver: true,
        }).start(onComplete);
      }
    } else {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: AnimationDurations.fast,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 0,
          duration: AnimationDurations.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  const renderOverlay = () => {
    switch (type) {
      case 'fade':
        return (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: color,
              opacity: animatedValue,
            }}
          />
        );
      
      case 'wipe':
        return (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: color,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-screenWidth, 0],
                  }),
                },
              ],
            }}
          />
        );
      
      case 'circle':
        const maxRadius = Math.sqrt(screenWidth ** 2 + screenHeight ** 2);
        return (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Animated.View
              style={{
                width: maxRadius * 2,
                height: maxRadius * 2,
                borderRadius: maxRadius,
                backgroundColor: color,
                transform: [
                  {
                    scale: circleScale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            />
          </View>
        );
      
      case 'split':
        return (
          <>
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: '50%',
                bottom: 0,
                backgroundColor: color,
                transform: [
                  {
                    translateX: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-screenWidth / 2, 0],
                    }),
                  },
                ],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                right: 0,
                bottom: 0,
                backgroundColor: color,
                transform: [
                  {
                    translateX: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [screenWidth / 2, 0],
                    }),
                  },
                ],
              }}
            />
          </>
        );
      
      default:
        return null;
    }
  };
  
  if (!visible && animatedValue._value === 0 && circleScale._value === 0) {
    return null;
  }
  
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {renderOverlay()}
    </View>
  );
}

// Shared element transition helper
export function SharedElement({
  children,
  id,
  animation = 'move',
  duration = AnimationDurations.normal,
}: {
  children: React.ReactNode;
  id: string;
  animation?: 'move' | 'fade' | 'scale';
  duration?: number;
}) {
  // This is a placeholder for shared element transitions
  // In a real implementation, this would work with navigation library
  return <View>{children}</View>;
}

// Page transition container
export function PageTransition({
  children,
  entering = true,
  type = 'default',
}: {
  children: React.ReactNode;
  entering?: boolean;
  type?: 'default' | 'game' | 'modal' | 'victory';
}) {
  const translateY = useRef(new Animated.Value(entering ? 100 : 0)).current;
  const opacity = useRef(new Animated.Value(entering ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(entering ? 0.9 : 1)).current;
  
  useEffect(() => {
    const animations = [];
    
    switch (type) {
      case 'game':
        animations.push(
          Animated.timing(opacity, {
            toValue: entering ? 1 : 0,
            duration: AnimationDurations.slow,
            useNativeDriver: true,
          })
        );
        break;
      
      case 'modal':
        animations.push(
          Animated.spring(translateY, {
            toValue: entering ? 0 : 100,
            damping: 25,
            stiffness: 500,
            mass: 0.7,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: entering ? 1 : 0,
            duration: AnimationDurations.fast,
            useNativeDriver: true,
          })
        );
        break;
      
      case 'victory':
        animations.push(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: entering ? 1.2 : 0.8,
              duration: AnimationDurations.fast,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 3,
              tension: 200,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(opacity, {
            toValue: entering ? 1 : 0,
            duration: AnimationDurations.normal,
            useNativeDriver: true,
          })
        );
        break;
      
      default:
        animations.push(
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: entering ? 0 : 100,
              duration: AnimationDurations.normal,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: entering ? 1 : 0,
              duration: AnimationDurations.normal,
              useNativeDriver: true,
            }),
          ])
        );
    }
    
    Animated.parallel(animations).start();
  }, [entering]);
  
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity,
        transform: [
          { translateY: type === 'modal' || type === 'default' ? translateY : 0 },
          { scale: type === 'victory' ? scale : 1 },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}