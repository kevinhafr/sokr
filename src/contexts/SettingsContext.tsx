// contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { supabase } from '@/services/supabase';

interface Settings {
  sound: boolean;
  vibration: boolean;
  notifications: boolean;
  autoPlay: boolean;
  showTimer: boolean;
  confirmActions: boolean;
  language: string;
  graphicsQuality: 'low' | 'medium' | 'high';
}

interface SettingsContextValue {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  sound: true,
  vibration: true,
  notifications: true,
  autoPlay: false,
  showTimer: true,
  confirmActions: true,
  language: 'fr',
  graphicsQuality: 'medium',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Charger depuis le stockage local
      const localSettings = await AsyncStorage.getItem('settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }

      // Si l'utilisateur est connecté, charger depuis le profil
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (profile?.settings) {
          const mergedSettings = { ...defaultSettings, ...profile.settings };
          setSettings(mergedSettings);
          await AsyncStorage.setItem('settings', JSON.stringify(mergedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Sauvegarder localement
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));

      // Si l'utilisateur est connecté, sauvegarder dans le profil
      if (user) {
        await supabase
          .from('profiles')
          .update({ settings: newSettings })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));

      if (user) {
        await supabase
          .from('profiles')
          .update({ settings: defaultSettings })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value: SettingsContextValue = {
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}