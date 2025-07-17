// Shared constants to avoid circular dependencies
import { Easing } from 'react-native';

// Core colors - Premium Football App Theme (AAA Studio Quality)
export const CoreColors = {
  // Backgrounds - Clean and modern
  background: '#F8FAFB',        // Light grey background
  surface: '#FFFFFF',           // Pure white surfaces
  card: '#FFFFFF',              // White cards with shadows
  overlay: 'rgba(0,0,0,0.4)',   // Modal overlays
  
  // Brand colors - Football inspired
  primary: '#00B04F',           // FIFA green (grass)
  primaryLight: '#22C55E',      // Lighter grass green
  primaryDark: '#059669',       // Darker grass green
  
  secondary: '#F59E0B',         // Golden yellow (trophies)
  secondaryLight: '#FCD34D',    // Light gold
  secondaryDark: '#D97706',     // Dark gold
  
  // Accent colors - Professional blue
  accent: '#1E40AF',            // Deep blue
  accentLight: '#3B82F6',       // Light blue
  accentDark: '#1E3A8A',        // Dark blue
  
  // Status colors - Clear and accessible
  success: '#10B981',           // Emerald green
  danger: '#EF4444',            // Red
  warning: '#F59E0B',           // Amber
  info: '#3B82F6',              // Blue
  
  // Text hierarchy - Readable and modern
  text: '#111827',              // Almost black
  textSecondary: '#6B7280',     // Medium grey
  textMuted: '#9CA3AF',         // Light grey
  textDisabled: '#D1D5DB',      // Very light grey
  
  // Borders and dividers - Subtle but defined
  border: '#E5E7EB',            // Light grey border
  borderLight: '#F3F4F6',       // Very light border
  divider: '#E5E7EB',           // Same as border
  
  // Special effects
  shadow: 'rgba(0, 0, 0, 0.1)', // Soft shadows
  glow: '#00B04F',              // Primary glow
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