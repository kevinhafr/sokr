// contexts/AppProvider.tsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { SoundProvider } from './SoundContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            <SoundProvider>
              {children}
            </SoundProvider>
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}