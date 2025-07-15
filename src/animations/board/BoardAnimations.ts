import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat
} from 'react-native-reanimated';

export const BoardAnimations = {
  // Surbrillance des positions disponibles
  highlightEligibleSlots: {
    scale: withRepeat(
      withSequence(
        withSpring(1.05),
        withSpring(1)
      ),
      -1,
      true
    ),
    opacity: withRepeat(
      withSequence(
        withSpring(1),
        withSpring(0.6)
      ),
      -1,
      true
    ),
    borderWidth: 2,
    borderColor: '#FFD700'
  },

  // Animation de placement de carte
  cardPlacement: {
    initial: { scale: 0, rotation: -180 },
    animate: {
      scale: withSpring(1, {
        damping: 12,
        stiffness: 100
      }),
      rotation: withSpring(0)
    },
    duration: 600
  },

  // Déplacement de la balle
  ballMovement: {
    duration: 800,
    path: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};