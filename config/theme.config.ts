export const themeConfig = {
  light: {
    colors: {
      primary: '#4CAF50',
      primaryDark: '#388E3C',
      primaryLight: '#66BB6A',
      secondary: '#FF9800',
      secondaryDark: '#F57C00',
      secondaryLight: '#FFB74D',
      
      background: '#FFFFFF',
      surface: '#F5F5F5',
      card: '#FFFFFF',
      
      text: '#212121',
      textSecondary: '#757575',
      textInverse: '#FFFFFF',
      
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      
      border: '#E0E0E0',
      divider: '#BDBDBD',
      shadow: '#000000',
      
      // Couleurs spécifiques au jeu
      grass: '#1a472a',
      grassLight: '#2d5a3d',
      grassDark: '#0d2818',
      
      cardCommon: '#B0BEC5',
      cardLimited: '#81C784',
      cardRare: '#64B5F6',
      cardSuperRare: '#BA68C8',
      cardUnique: '#FFD54F',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    borderRadius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      full: 9999,
    },
    shadows: {
      none: {},
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  },
  dark: {
    colors: {
      primary: '#66BB6A',
      primaryDark: '#4CAF50',
      primaryLight: '#81C784',
      secondary: '#FFB74D',
      secondaryDark: '#FF9800',
      secondaryLight: '#FFCC80',
      
      background: '#121212',
      surface: '#1E1E1E',
      card: '#1E1E1E',
      
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textInverse: '#212121',
      
      success: '#66BB6A',
      warning: '#FFB74D',
      error: '#EF5350',
      info: '#42A5F5',
      
      border: '#424242',
      divider: '#616161',
      shadow: '#000000',
      
      // Couleurs spécifiques au jeu (ajustées pour le mode sombre)
      grass: '#0d2818',
      grassLight: '#1a472a',
      grassDark: '#061812',
      
      cardCommon: '#90A4AE',
      cardLimited: '#66BB6A',
      cardRare: '#42A5F5',
      cardSuperRare: '#AB47BC',
      cardUnique: '#FFC107',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    borderRadius: {
      none: 0,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
      full: 9999,
    },
    shadows: {
      none: {},
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  },
};

export type Theme = typeof themeConfig.light;
export type ThemeColor = keyof Theme['colors'];
export type ThemeSpacing = keyof Theme['spacing'];