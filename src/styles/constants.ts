// Shared constants to avoid circular dependencies
import { Easing } from 'react-native';

// Core colors used across the theme
export const CoreColors = {
  background: '#0A0E27',
  surface: '#151A36',
  card: '#1E2444',
  primary: '#00FF87',
  primaryLight: '#33FFB3',
  secondary: '#FFD700',
  secondaryLight: '#FFEB3B',
  danger: '#FF4757',
  success: '#00D364',
  warning: '#FFB800',
  info: '#0099FF',
  text: '#FFFFFF',
  textSecondary: '#B8BED9',
  textMuted: '#7A8299',
  border: '#2A3152',
};

export const AnimationDurations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 1000,
  epic: 2000,
};

export const AnimationEasings = {
  // Standard easings
  linear: Easing.linear,
  easeIn: Easing.ease,
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  
  // Bounce effects
  bounce: Easing.bounce,
  elastic: Easing.elastic(1),
  
  // Gaming specific
  smooth: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  snappy: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  anticipate: Easing.bezier(0.68, -0.6, 0.32, 1.6),
};