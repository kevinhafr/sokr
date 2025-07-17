// contexts/ThemeContext.tsx
import React, { createContext, useContext } from 'react';
import { GameTheme } from '@/styles';

interface ThemeContextValue {
  colors: typeof GameTheme.colors;
  theme: typeof GameTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value: ThemeContextValue = {
    colors: GameTheme.colors,
    theme: GameTheme,
  };
  
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}