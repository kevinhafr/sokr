// Sokr Game Theme - Professional Mobile Game Design System
import { Typography, FontFamilies, textShadows } from './typography';
import { Gradients, AnimatedGradients } from './gradients';
import { ColorModes, EventThemes, TeamColors } from './colorModes';
import { AdvancedShadows, BlurEffects, BorderEffects, GlowEffects, TransformEffects, CompositeEffects } from './effects';
import { NotificationStyles } from './notifications';
import { Animations } from './animations';

export const GameTheme = {
  // Color Palette - Dark premium gaming aesthetic
  colors: {
    // Core backgrounds
    background: '#0A0E27',      // Deep blue-black
    surface: '#151A36',         // Card background
    card: '#1E2444',           // Elevated surface
    overlay: 'rgba(0,0,0,0.7)', // Modal/overlay
    
    // Text hierarchy
    text: '#FFFFFF',
    textSecondary: '#B8BED9',
    textMuted: '#7A8299',
    textDisabled: '#4A5068',
    
    // Primary actions & brand
    primary: '#00FF87',         // Vibrant green - main CTA
    primaryDark: '#00CC6A',
    primaryLight: '#33FFB3',
    
    // Secondary & rewards
    secondary: '#FFD700',       // Gold - premium/rewards
    secondaryDark: '#CCAC00',
    secondaryLight: '#FFEB3B',
    
    // Game states
    success: '#00D364',         // Positive actions
    danger: '#FF4757',          // Errors/warnings
    info: '#0099FF',           // Information
    warning: '#FFB800',        // Caution
    
    // Player positions (football specific)
    goalkeeper: '#FFB800',
    defender: '#00D364',
    midfielder: '#0099FF',
    attacker: '#FF3838',
    
    // Card rarities
    rarityCommon: '#B8BED9',
    rarityRare: '#00B4D8',
    rarityEpic: '#B744FF',
    rarityLegendary: '#FFD700',
    
    // UI elements
    border: '#2A3152',
    borderLight: '#3A4162',
    divider: '#1E2444',
    
    // Special effects
    glow: '#00FF87',
    shimmer: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Spacing system (8pt grid)
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Typography system - safely defined
  typography: {
    ...Typography,
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
  },
  fonts: {
    bebas: 'BebasNeue',
    geist: 'Geist',
    system: 'System',
    mono: 'Menlo',
  },
  fontWeights: {
    regular: '400',
    medium: '500', 
    semibold: '600',
    bold: '700',
    black: '900',
  },
  textShadows,
  
  // Border radius system
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 999,
    card: 12,
    button: 8,
  },
  radius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 999,
    card: 12,
    button: 8,
  },
  
  // Shadow system
  shadows: {
    none: {},
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    // Special shadows
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 10,
    },
    glow: {
      shadowColor: '#00FF87',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 0,
    },
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    notification: 1600,
  },
  
  // Extended theme features
  gradients: Gradients,
  animatedGradients: AnimatedGradients,
  colorModes: ColorModes,
  eventThemes: EventThemes,
  teamColors: TeamColors,
  advancedShadows: AdvancedShadows,
  blurEffects: BlurEffects,
  borderEffects: BorderEffects,
  glowEffects: GlowEffects,
  transformEffects: TransformEffects,
  compositeEffects: CompositeEffects,
  notifications: NotificationStyles,
  animations: Animations,
};

// Type export for TypeScript
export type Theme = typeof GameTheme;

// Preset component styles with typography
export const ComponentStyles = {
  // Premium button style
  primaryButton: {
    backgroundColor: GameTheme.colors.primary,
    paddingVertical: GameTheme.spacing.md,
    paddingHorizontal: GameTheme.spacing.xl,
    borderRadius: GameTheme.borderRadius.button,
    ...GameTheme.shadows.md,
  },
  primaryButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: '#0A0E27',
    ...textShadows.subtle,
  },
  
  // Card container
  gameCard: {
    backgroundColor: GameTheme.colors.card,
    borderRadius: GameTheme.borderRadius.card,
    padding: GameTheme.spacing.lg,
    ...GameTheme.shadows.card,
  },
  
  // Premium gold button
  premiumButton: {
    backgroundColor: GameTheme.colors.secondary,
    paddingVertical: GameTheme.spacing.md,
    paddingHorizontal: GameTheme.spacing.xl,
    borderRadius: GameTheme.borderRadius.button,
    ...GameTheme.shadows.lg,
    borderWidth: 2,
    borderColor: GameTheme.colors.secondaryLight,
  },
  premiumButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: '#0A0E27',
    ...textShadows.depth,
  },
  
  // Glass effect overlay
  glassOverlay: {
    backgroundColor: 'rgba(30, 36, 68, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: GameTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Typography presets
  screenTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 48,
    lineHeight: 55,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: GameTheme.colors.text,
    ...textShadows.depth,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: GameTheme.colors.text,
    ...textShadows.subtle,
  },
  cardTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: GameTheme.colors.text,
  },
  bodyText: {
    fontFamily: 'Geist',
    fontSize: 16,
    lineHeight: 24,
    color: GameTheme.colors.textSecondary,
  },
  label: {
    fontFamily: 'Geist',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: GameTheme.colors.textMuted,
  },
};