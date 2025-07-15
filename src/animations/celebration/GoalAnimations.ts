import {
  withSpring,
  withSequence,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

export const GoalAnimations = {
  // Animation de but
  goalScored: {
    particles: {
      count: 30,
      colors: ['#FFD700', '#FFA500', '#FF6347'],
      duration: 2000,
      spread: 360
    },
    scoreCounter: {
      scale: withSequence(
        withSpring(2),
        withSpring(1.5),
        withSpring(1)
      )
    },
    soundEffect: 'goal_celebration.mp3'
  },

  // Animation de victoire
  victory: {
    trophy: {
      translateY: withSpring(-100),
      rotate: withRepeat(
        withSequence(
          withTiming(10, { duration: 200 }),
          withTiming(-10, { duration: 200 })
        ),
        3,
        true
      )
    },
    confetti: {
      count: 100,
      duration: 5000
    }
  }
};