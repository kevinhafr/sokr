// Sokr Game Theme - AAA Studio Quality Football App
import { CoreColors } from './constants';

export const GameTheme = {
  // Color Palette - Premium Football App (AAA Studio Quality)
  colors: {
    // Core backgrounds - Clean and modern
    background: CoreColors.background,
    surface: CoreColors.surface,
    card: CoreColors.card,
    overlay: CoreColors.overlay,
    
    // Text hierarchy - Readable and accessible
    text: CoreColors.text,
    textSecondary: CoreColors.textSecondary,
    textMuted: CoreColors.textMuted,
    textDisabled: CoreColors.textDisabled,
    
    // Brand colors - Football inspired
    primary: CoreColors.primary,
    primaryLight: CoreColors.primaryLight,
    primaryDark: CoreColors.primaryDark,
    
    secondary: CoreColors.secondary,
    secondaryLight: CoreColors.secondaryLight,
    secondaryDark: CoreColors.secondaryDark,
    
    accent: CoreColors.accent,
    accentLight: CoreColors.accentLight,
    accentDark: CoreColors.accentDark,
    
    // Status colors - Clear and accessible
    success: CoreColors.success,
    danger: CoreColors.danger,
    warning: CoreColors.warning,
    info: CoreColors.info,
    
    // Football positions (color-coded)
    goalkeeper: '#8B5CF6',      // Purple
    defender: '#10B981',        // Green
    midfielder: '#3B82F6',      // Blue
    attacker: '#EF4444',        // Red
    
    // Card rarities - Premium feel
    rarityCommon: '#6B7280',    // Grey
    rarityRare: '#3B82F6',      // Blue
    rarityEpic: '#8B5CF6',      // Purple
    rarityLegendary: '#F59E0B', // Gold
    
    // UI elements - Subtle but defined
    border: CoreColors.border,
    borderLight: CoreColors.borderLight,
    divider: CoreColors.divider,
    
    // Special effects
    shadow: CoreColors.shadow,
    glow: CoreColors.glow,
  },
  
  // Spacing system (8pt grid) - Clean and consistent
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
  
  // Typography system - Modern and readable
  typography: {
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
    lineHeight: {
      xs: 14,
      sm: 16,
      base: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 36,
      xxxl: 48,
    },
  },
  
  // Font system - Professional
  fonts: {
    heading: 'Inter-Bold',     // Clean headings
    body: 'Inter-Regular',     // Readable body text
    mono: 'SF Mono',           // Code/numbers
    display: 'Inter-Black',    // Hero text
  },
  fontWeights: {
    regular: '400',
    medium: '500', 
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  // Border radius system - Modern and consistent
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
  
  // Shadow system - Soft and professional
  shadows: {
    none: {},
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    // Special shadows
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    glow: {
      shadowColor: CoreColors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 0,
    },
  },
  
  // Animation durations - Smooth and responsive
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  
  // Z-index layers - Organized and clear
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
    notification: 1600,
  },
  
  // Gradients - Modern and subtle
  gradients: {
    primary: {
      colors: [CoreColors.primary, CoreColors.primaryDark],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondary: {
      colors: [CoreColors.secondary, CoreColors.secondaryDark],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    background: {
      colors: [CoreColors.background, CoreColors.surface],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
    card: {
      colors: [CoreColors.card, CoreColors.surface],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
};

// Type export for TypeScript
export type Theme = typeof GameTheme;

// Component styles - Clean and consistent
export const ComponentStyles = {
  // Primary button - Modern and accessible
  primaryButton: {
    backgroundColor: GameTheme.colors.primary,
    paddingVertical: GameTheme.spacing.md,
    paddingHorizontal: GameTheme.spacing.xl,
    borderRadius: GameTheme.borderRadius.button,
    ...GameTheme.shadows.md,
  },
  primaryButtonText: {
    fontFamily: GameTheme.fonts.heading,
    fontSize: GameTheme.typography.fontSize.md,
    lineHeight: GameTheme.typography.lineHeight.md,
    fontWeight: GameTheme.fontWeights.semibold,
    color: GameTheme.colors.card,
    textAlign: 'center' as const,
  },
  
  // Card container - Clean and elevated
  gameCard: {
    backgroundColor: GameTheme.colors.card,
    borderRadius: GameTheme.borderRadius.card,
    padding: GameTheme.spacing.lg,
    ...GameTheme.shadows.card,
    borderWidth: 1,
    borderColor: GameTheme.colors.border,
  },
  
  // Secondary button - Golden accent
  secondaryButton: {
    backgroundColor: GameTheme.colors.secondary,
    paddingVertical: GameTheme.spacing.md,
    paddingHorizontal: GameTheme.spacing.xl,
    borderRadius: GameTheme.borderRadius.button,
    ...GameTheme.shadows.md,
  },
  secondaryButtonText: {
    fontFamily: GameTheme.fonts.heading,
    fontSize: GameTheme.typography.fontSize.md,
    lineHeight: GameTheme.typography.lineHeight.md,
    fontWeight: GameTheme.fontWeights.semibold,
    color: GameTheme.colors.card,
    textAlign: 'center' as const,
  },
  
  // Typography presets - Modern and readable
  screenTitle: {
    fontFamily: GameTheme.fonts.display,
    fontSize: GameTheme.typography.fontSize.xxxl,
    lineHeight: GameTheme.typography.lineHeight.xxxl,
    fontWeight: GameTheme.fontWeights.black,
    color: GameTheme.colors.text,
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontFamily: GameTheme.fonts.heading,
    fontSize: GameTheme.typography.fontSize.xxl,
    lineHeight: GameTheme.typography.lineHeight.xxl,
    fontWeight: GameTheme.fontWeights.bold,
    color: GameTheme.colors.text,
  },
  cardTitle: {
    fontFamily: GameTheme.fonts.heading,
    fontSize: GameTheme.typography.fontSize.lg,
    lineHeight: GameTheme.typography.lineHeight.lg,
    fontWeight: GameTheme.fontWeights.semibold,
    color: GameTheme.colors.text,
  },
  bodyText: {
    fontFamily: GameTheme.fonts.body,
    fontSize: GameTheme.typography.fontSize.base,
    lineHeight: GameTheme.typography.lineHeight.base,
    color: GameTheme.colors.textSecondary,
  },
  label: {
    fontFamily: GameTheme.fonts.body,
    fontSize: GameTheme.typography.fontSize.sm,
    lineHeight: GameTheme.typography.lineHeight.sm,
    fontWeight: GameTheme.fontWeights.medium,
    color: GameTheme.colors.textMuted,
    textTransform: 'uppercase' as const,
  },
};