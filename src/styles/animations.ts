// Animation presets for AAA gaming experience
import { Animated, Easing } from 'react-native';
import { AnimationDurations, AnimationEasings } from './constants';

// Preset animations
export const Animations = {
  // Fade animations
  fadeIn: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: AnimationEasings.easeOut,
      useNativeDriver: true,
    });
  },
  
  fadeOut: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: AnimationEasings.easeIn,
      useNativeDriver: true,
    });
  },
  
  // Scale animations
  scaleIn: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.spring(value, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    });
  },
  
  scaleOut: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: AnimationEasings.anticipate,
      useNativeDriver: true,
    });
  },
  
  // Bounce effect
  bounce: (value: Animated.Value, toValue = 1) => {
    return Animated.spring(value, {
      toValue,
      tension: 40,
      friction: 3,
      useNativeDriver: true,
    });
  },
  
  // Slide animations
  slideInLeft: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: AnimationEasings.smooth,
      useNativeDriver: true,
    });
  },
  
  slideInRight: (value: Animated.Value, duration = AnimationDurations.normal) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: AnimationEasings.smooth,
      useNativeDriver: true,
    });
  },
  
  // Rotation animations
  rotate360: (value: Animated.Value, duration = AnimationDurations.slow) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      easing: AnimationEasings.linear,
      useNativeDriver: true,
    });
  },
  
  // Pulse animation
  pulse: (value: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: AnimationDurations.fast,
        easing: AnimationEasings.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: AnimationDurations.fast,
        easing: AnimationEasings.easeIn,
        useNativeDriver: true,
      }),
    ]);
  },
  
  // Shake animation
  shake: (value: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 10,
        duration: 50,
        easing: AnimationEasings.linear,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -10,
        duration: 50,
        easing: AnimationEasings.linear,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 10,
        duration: 50,
        easing: AnimationEasings.linear,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: -10,
        duration: 50,
        easing: AnimationEasings.linear,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 50,
        easing: AnimationEasings.linear,
        useNativeDriver: true,
      }),
    ]);
  },
  
  // Complex gaming animations
  levelUp: (value: Animated.Value) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.5,
        duration: AnimationDurations.normal,
        easing: AnimationEasings.anticipate,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        tension: 20,
        friction: 3,
        useNativeDriver: true,
      }),
    ]);
  },
  
  coinFlip: (value: Animated.Value) => {
    return Animated.timing(value, {
      toValue: 4,
      duration: AnimationDurations.verySlow,
      easing: AnimationEasings.anticipate,
      useNativeDriver: true,
    });
  },
  
  cardDeal: (value: Animated.Value, delay = 0) => {
    return Animated.sequence([
      Animated.delay(delay),
      Animated.spring(value, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);
  },
};

// Stagger animation helper
export const staggerAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay = 100
) => {
  return Animated.stagger(staggerDelay, animations);
};

// Loop animation helper
export const loopAnimation = (animation: Animated.CompositeAnimation, iterations = -1) => {
  return Animated.loop(animation, { iterations });
};

// Parallel animation helper
export const parallelAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

// Sequence animation helper
export const sequenceAnimation = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations);
};