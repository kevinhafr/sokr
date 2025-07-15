export const colors = {
  light: {
    background: '#fcfcfc',
    foreground: '#000000',
    card: '#ffffff',
    cardForeground: '#000000',
    popover: '#fcfcfc',
    popoverForeground: '#000000',
    primary: '#000000',
    primaryForeground: '#ffffff',
    secondary: '#ebebeb',
    secondaryForeground: '#000000',
    muted: '#f5f5f5',
    mutedForeground: '#525252',
    accent: '#ebebeb',
    accentForeground: '#000000',
    destructive: '#e54b4f',
    destructiveForeground: '#ffffff',
    border: '#e4e4e4',
    input: '#ebebeb',
    ring: '#000000',
    
    // Chart colors
    chart1: '#ffae04',
    chart2: '#2d62ef',
    chart3: '#a4a4a4',
    chart4: '#e4e4e4',
    chart5: '#747474',
    
    // Game specific
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  
  dark: {
    background: '#000000',
    foreground: '#ffffff',
    card: '#090909',
    cardForeground: '#ffffff',
    popover: '#121212',
    popoverForeground: '#ffffff',
    primary: '#ffffff',
    primaryForeground: '#000000',
    secondary: '#222222',
    secondaryForeground: '#ffffff',
    muted: '#1d1d1d',
    mutedForeground: '#a4a4a4',
    accent: '#333333',
    accentForeground: '#ffffff',
    destructive: '#ff5b5b',
    destructiveForeground: '#000000',
    border: '#242424',
    input: '#333333',
    ring: '#a4a4a4',
    
    // Chart colors
    chart1: '#ffae04',
    chart2: '#2671f4',
    chart3: '#747474',
    chart4: '#525252',
    chart5: '#e4e4e4',
    
    // Game specific
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
  }
};

export type ColorScheme = keyof typeof colors;
export type Colors = typeof colors.light;