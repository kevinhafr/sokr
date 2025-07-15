import {
  withSpring,
  withTiming
} from 'react-native-reanimated';

export const ScreenTransitions = {
  // Transition fluide entre écrans
  smooth: {
    from: { opacity: 0, translateX: 20 },
    animate: {
      opacity: withTiming(1, { duration: 400 }),
      translateX: withSpring(0)
    },
    exit: {
      opacity: withTiming(0, { duration: 300 }),
      translateX: withTiming(-20)
    }
  },

  // Modal apparition
  modal: {
    backdrop: {
      opacity: withTiming(0.5, { duration: 300 })
    },
    content: {
      translateY: withSpring(0, {
        damping: 20,
        stiffness: 300
      })
    }
  }
};