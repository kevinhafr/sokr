import {
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';

export const DiceAnimations = {
  // Lancer de dé
  roll: {
    duration: 1200,
    rotations: 5,
    bounceEffect: {
      damping: 10,
      stiffness: 100,
      mass: 0.8
    }
  },

  // Révélation du résultat
  reveal: {
    scale: withSequence(
      withSpring(1.3),
      withSpring(1)
    ),
    opacity: withTiming(1, { duration: 300 })
  }
};