import {
  withSpring,
  withSequence,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

export const CardAnimations = {
  // Sélection de carte
  selection: {
    scale: withSpring(1.1),
    elevation: 8,
    shadowOpacity: 0.3
  },

  // Retournement de carte
  flip: {
    rotateY: withSpring(180, {
      damping: 15,
      stiffness: 100
    }),
    duration: 500
  },

  // Effet de brillance (carte rare)
  shimmer: {
    translateX: withRepeat(
      withSequence(
        withTiming(-100, { duration: 0 }),
        withTiming(100, { duration: 1000 })
      ),
      -1,
      false
    )
  }
};