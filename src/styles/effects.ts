// Advanced Visual Effects for AAA Gaming Experience
import { Platform } from 'react-native';
import { CoreColors } from './constants';

// Enhanced shadow system with multiple layers
export const AdvancedShadows = {
  // Neumorphism effect (soft UI)
  neumorphic: {
    light: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    dark: {
      shadowColor: '#000000',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
  },
  
  // Deep elevation shadows
  depth: {
    level1: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 2,
    },
    level2: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 5.46,
      elevation: 5,
    },
    level3: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 8.30,
      elevation: 8,
    },
    level4: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10.32,
      elevation: 12,
    },
    level5: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.30,
      shadowRadius: 13.16,
      elevation: 16,
    },
  },
  
  // Colored shadows for special effects
  coloredShadows: {
    primary: {
      shadowColor: CoreColors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    gold: {
      shadowColor: CoreColors.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 10,
    },
    danger: {
      shadowColor: CoreColors.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Floating effect
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  
  // Inner shadow effect (for pressed states)
  inner: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
};

// Blur effects for glass morphism
export const BlurEffects = {
  light: {
    intensity: 20,
    tint: 'light',
  },
  medium: {
    intensity: 40,
    tint: 'dark',
  },
  heavy: {
    intensity: 80,
    tint: 'dark',
  },
  ultra: {
    intensity: 100,
    tint: 'chromeMaterialDark',
  },
};

// Border effects
export const BorderEffects = {
  // Gradient borders
  gradientBorder: (colors: string[], width = 2) => ({
    borderWidth: width,
    borderColor: 'transparent',
    backgroundImage: `linear-gradient(${colors.join(', ')})`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  }),
  
  // Animated border
  animatedBorder: {
    borderWidth: 2,
    borderColor: CoreColors.primary,
    borderStyle: 'dashed',
  },
  
  // Double border
  doubleBorder: {
    borderWidth: 1,
    borderColor: CoreColors.border,
    ...Platform.select({
      web: {
        outline: `1px solid ${CoreColors.primary}`,
        outlineOffset: '2px',
      },
    }),
  },
};

// Glow effects
export const GlowEffects = {
  // Soft glow
  soft: {
    shadowColor: '#00FF87', // glow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  // Intense glow
  intense: {
    shadowColor: '#00FF87', // glow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  
  // Pulse glow (for animations)
  pulse: {
    shadowColor: '#00FF87', // glow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  
  // Multi-color glow
  rainbow: [
    {
      shadowColor: '#FF0000',
      shadowOffset: { width: -5, height: -5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    {
      shadowColor: '#00FF00',
      shadowOffset: { width: 5, height: -5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    {
      shadowColor: '#0000FF',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
  ],
};

// Transform effects
export const TransformEffects = {
  // 3D card flip
  cardFlip: (progress: number) => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${progress * 180}deg` },
    ],
  }),
  
  // Tilt effect
  tilt: (x: number, y: number, intensity = 10) => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${y * intensity}deg` },
      { rotateY: `${x * intensity}deg` },
    ],
  }),
  
  // Scale bounce
  bounce: (scale: number) => ({
    transform: [{ scale }],
  }),
  
  // Skew effect
  skew: (x: number, y: number) => ({
    transform: [
      { skewX: `${x}deg` },
      { skewY: `${y}deg` },
    ],
  }),
};

// Composite effects (combining multiple effects)
export const CompositeEffects = {
  // Premium card effect
  premiumCard: {
    ...AdvancedShadows.depth.level4,
    ...GlowEffects.soft,
    borderWidth: 2,
    borderColor: CoreColors.secondary,
  },
  
  // Floating button
  floatingButton: {
    ...AdvancedShadows.floating,
    ...TransformEffects.bounce(1),
  },
  
  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...AdvancedShadows.depth.level2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Neon text
  neonText: {
    ...GlowEffects.intense,
    textShadowColor: CoreColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
};