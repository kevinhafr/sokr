// Screen Transition Animations for AAA Gaming Experience
import { Animated, Easing, Dimensions } from 'react-native';
import { AnimationDurations, AnimationEasings, CoreColors } from './constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Transition types
export const TransitionPresets = {
  // Slide transitions
  slideFromRight: {
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }),
        },
      };
    },
  },
  
  slideFromBottom: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  // Fade transitions
  fade: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
  },
  
  fadeFromBottomAndroid: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height * 0.08, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  // Scale transitions
  scaleFromCenter: {
    cardStyleInterpolator: ({ current, next }: any) => {
      const scale = Animated.add(
        current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        next
          ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            })
          : 0
      );

      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              scale,
            },
          ],
        },
      };
    },
  },
  
  // Flip transitions
  flipHorizontal: {
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
      const { width } = layouts.screen;
      const { progress } = current;

      const rotateY = Animated.add(
        progress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
        next
          ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['180deg', '0deg'],
            })
          : 0
      );

      return {
        cardStyle: {
          backfaceVisibility: 'hidden',
          transform: [
            { perspective: width },
            { translateX: width / 2 },
            { rotateY },
            { translateX: -width / 2 },
          ],
        },
      };
    },
  },
  
  // Custom gaming transitions
  portal: {
    cardStyleInterpolator: ({ current, next, layouts }: any) => {
      const { width, height } = layouts.screen;
      
      return {
        cardStyle: {
          opacity: current.progress,
          transform: [
            {
              scale: current.progress.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1.2, 1],
              }),
            },
            {
              rotate: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['180deg', '0deg'],
              }),
            },
          ],
        },
      };
    },
  },
  
  glitch: {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
            outputRange: [0, 1, 0, 1, 0, 1],
          }),
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: [0, -10, 10, -5, 5, 0],
              }),
            },
          ],
        },
      };
    },
  },
  
  levelComplete: {
    cardStyleInterpolator: ({ current, layouts }: any) => {
      const { height } = layouts.screen;
      
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 0.3, 0.6, 1],
                outputRange: [height, -50, 20, 0],
              }),
            },
            {
              scale: current.progress.interpolate({
                inputRange: [0, 0.3, 0.6, 1],
                outputRange: [0.8, 1.1, 0.95, 1],
              }),
            },
            {
              rotate: current.progress.interpolate({
                inputRange: [0, 0.3, 0.6, 1],
                outputRange: ['0deg', '5deg', '-2deg', '0deg'],
              }),
            },
          ],
          opacity: current.progress.interpolate({
            inputRange: [0, 0.1, 1],
            outputRange: [0, 1, 1],
          }),
        },
      };
    },
  },
};

// Navigation options for different screen types
export const ScreenTransitions = {
  // Default transition
  default: {
    ...TransitionPresets.slideFromRight,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.normal,
          easing: Easing.out(Easing.poly(5)),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.fast,
          easing: Easing.in(Easing.poly(5)),
        },
      },
    },
  },
  
  // Modal screens
  modal: {
    ...TransitionPresets.slideFromBottom,
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          damping: 25,
          stiffness: 500,
          mass: 0.7,
          overshootClamping: true,
          restDisplacementThreshold: 0.1,
          restSpeedThreshold: 0.1,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.fast,
          easing: Easing.out(Easing.ease),
        },
      },
    },
  },
  
  // Game screens
  game: {
    ...TransitionPresets.fade,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.normal,
          easing: Easing.inOut(Easing.ease),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.normal,
          easing: Easing.inOut(Easing.ease),
        },
      },
    },
  },
  
  // Victory/Defeat screens
  victory: {
    ...TransitionPresets.levelComplete,
    transitionSpec: {
      open: {
        animation: 'spring',
        config: {
          damping: 15,
          stiffness: 100,
          mass: 1,
          overshootClamping: false,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.normal,
          easing: Easing.in(Easing.ease),
        },
      },
    },
  },
  
  // Settings/Menu screens
  menu: {
    ...TransitionPresets.scaleFromCenter,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.fast,
          easing: Easing.out(Easing.back(1.5)),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.fast,
          easing: Easing.in(Easing.ease),
        },
      },
    },
  },
  
  // Special effect transitions
  portal: {
    ...TransitionPresets.portal,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.slow,
          easing: Easing.inOut(Easing.circle),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.slow,
          easing: Easing.inOut(Easing.circle),
        },
      },
    },
  },
  
  glitch: {
    ...TransitionPresets.glitch,
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.normal,
          easing: Easing.linear,
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: AnimationDurations.fast,
          easing: Easing.linear,
        },
      },
    },
  },
};

// Shared element transition configurations
export const SharedElementTransitions = {
  // Card to detail view
  cardExpand: {
    animation: 'move',
    resize: 'clip',
    align: 'center-center',
    duration: AnimationDurations.normal,
    easing: Easing.inOut(Easing.ease),
  },
  
  // Image hero transition
  imageHero: {
    animation: 'move',
    resize: 'stretch',
    align: 'center-center',
    duration: AnimationDurations.slow,
    easing: Easing.out(Easing.poly(5)),
  },
  
  // Fade through transition
  fadeThrough: {
    animation: 'fade',
    resize: 'none',
    align: 'center-center',
    duration: AnimationDurations.fast,
    easing: Easing.linear,
  },
};

// Helper function to apply transition to navigation options
export const applyTransition = (
  transitionType: keyof typeof ScreenTransitions = 'default'
) => {
  const transition = ScreenTransitions[transitionType] || ScreenTransitions.default;
  
  return {
    headerShown: false,
    ...transition,
    cardStyle: {
      backgroundColor: CoreColors.background,
    },
    cardOverlayEnabled: true,
    cardShadowEnabled: true,
  };
};