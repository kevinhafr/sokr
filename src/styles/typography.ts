// Typography System - AAA Game Studio Quality
import { Platform } from 'react-native';

// Font Families
export const FontFamilies = {
  // Bebas Neue pour les titres et headers
  bebas: 'BebasNeue',
  
  // Geist pour le corps de texte
  geist: 'Geist',
  
  // Fallback system fonts
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Typography Scale - AAA Gaming Hierarchy
export const Typography = {
  // Display - Bebas Neue (Epic headers)
  display: {
    hero: {
      fontFamily: FontFamilies.bebas,
      fontSize: 72,
      lineHeight: 72 * 1.1,
      letterSpacing: 2,
      textTransform: 'uppercase' as const,
    },
    large: {
      fontFamily: FontFamilies.bebas,
      fontSize: 56,
      lineHeight: 56 * 1.1,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
    medium: {
      fontFamily: FontFamilies.bebas,
      fontSize: 48,
      lineHeight: 48 * 1.15,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
    small: {
      fontFamily: FontFamilies.bebas,
      fontSize: 36,
      lineHeight: 36 * 1.2,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Headers - Bebas Neue (Section titles)
  header: {
    h1: {
      fontFamily: FontFamilies.bebas,
      fontSize: 32,
      lineHeight: 32 * 1.2,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    h2: {
      fontFamily: FontFamilies.bebas,
      fontSize: 28,
      lineHeight: 28 * 1.25,
      letterSpacing: 0.25,
      textTransform: 'uppercase' as const,
    },
    h3: {
      fontFamily: FontFamilies.bebas,
      fontSize: 24,
      lineHeight: 24 * 1.3,
      letterSpacing: 0.15,
      textTransform: 'uppercase' as const,
    },
    h4: {
      fontFamily: FontFamilies.bebas,
      fontSize: 20,
      lineHeight: 20 * 1.35,
      letterSpacing: 0.1,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Body - Geist (Regular content)
  body: {
    large: {
      fontFamily: FontFamilies.geist,
      fontSize: 18,
      lineHeight: 18 * 1.6,
      letterSpacing: 0,
    },
    regular: {
      fontFamily: FontFamilies.geist,
      fontSize: 16,
      lineHeight: 16 * 1.6,
      letterSpacing: 0,
    },
    small: {
      fontFamily: FontFamilies.geist,
      fontSize: 14,
      lineHeight: 14 * 1.6,
      letterSpacing: 0,
    },
    tiny: {
      fontFamily: FontFamilies.geist,
      fontSize: 12,
      lineHeight: 12 * 1.5,
      letterSpacing: 0,
    },
  },
  
  // UI Elements - Mixed usage
  ui: {
    // Buttons - Bebas for primary CTAs
    buttonLarge: {
      fontFamily: FontFamilies.bebas,
      fontSize: 20,
      lineHeight: 20 * 1.2,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
    buttonMedium: {
      fontFamily: FontFamilies.bebas,
      fontSize: 18,
      lineHeight: 18 * 1.2,
      letterSpacing: 0.75,
      textTransform: 'uppercase' as const,
    },
    buttonSmall: {
      fontFamily: FontFamilies.geist,
      fontSize: 14,
      lineHeight: 14 * 1.2,
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    
    // Labels - Geist
    label: {
      fontFamily: FontFamilies.geist,
      fontSize: 14,
      lineHeight: 14 * 1.4,
      letterSpacing: 0.1,
      fontWeight: '600',
    },
    caption: {
      fontFamily: FontFamilies.geist,
      fontSize: 12,
      lineHeight: 12 * 1.4,
      letterSpacing: 0.2,
    },
    
    // Stats & Numbers - Bebas
    statLarge: {
      fontFamily: FontFamilies.bebas,
      fontSize: 36,
      lineHeight: 36,
      letterSpacing: 1,
    },
    statMedium: {
      fontFamily: FontFamilies.bebas,
      fontSize: 24,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    statSmall: {
      fontFamily: FontFamilies.bebas,
      fontSize: 18,
      lineHeight: 18,
      letterSpacing: 0.25,
    },
  },
  
  // Special Gaming Elements
  gaming: {
    // Score displays
    score: {
      fontFamily: FontFamilies.bebas,
      fontSize: 48,
      lineHeight: 48,
      letterSpacing: 2,
      textShadowColor: 'rgba(0, 255, 135, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
    },
    // Rank/Level
    rank: {
      fontFamily: FontFamilies.bebas,
      fontSize: 64,
      lineHeight: 64,
      letterSpacing: 3,
      textTransform: 'uppercase' as const,
    },
    // Timer
    timer: {
      fontFamily: FontFamilies.bebas,
      fontSize: 32,
      lineHeight: 32,
      letterSpacing: 1,
    },
    // Currency
    currency: {
      fontFamily: FontFamilies.bebas,
      fontSize: 24,
      lineHeight: 24,
      letterSpacing: 0.5,
      color: '#FFD700', // Gold color
    },
  },
};

// Font Weight Map (for Geist)
export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
};

// Helper function to apply text shadow for premium effect
export const textShadows = {
  glow: {
    textShadowColor: 'rgba(0, 255, 135, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  depth: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtle: {
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
};