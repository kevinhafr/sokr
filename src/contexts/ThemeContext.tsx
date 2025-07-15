// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameTheme } from '@/styles';

type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  colors: typeof GameTheme.colors;
  isDark: boolean;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  themeMode: 'light' | 'dark' | 'auto';
  theme: typeof GameTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');

  // Charger la préférence de thème
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Mettre à jour le thème basé sur le mode
  useEffect(() => {
    if (themeMode === 'auto') {
      setColorScheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setColorScheme(themeMode as ColorScheme);
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setThemeMode(savedMode as 'light' | 'dark' | 'auto');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = colorScheme === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const handleSetThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  // For now, we'll use the default dark theme colors
  // In the future, we could switch between different color modes
  const colors = GameTheme.colors;
  const isDark = colorScheme === 'dark';

  const value: ThemeContextValue = {
    colors,
    isDark,
    colorScheme,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
    themeMode,
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