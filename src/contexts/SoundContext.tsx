// contexts/SoundContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from './SettingsContext';

interface SoundMap {
  [key: string]: Audio.Sound;
}

interface SoundContextValue {
  playSound: (soundName: string) => Promise<void>;
  stopSound: (soundName: string) => Promise<void>;
  playBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  setSoundVolume: (volume: number) => Promise<void>;
  preloadSounds: () => Promise<void>;
}

const soundAssets = {
  buttonClick: require('@/assets/sounds/button-click.mp3'),
  cardPlace: require('@/assets/sounds/card-place.mp3'),
  cardFlip: require('@/assets/sounds/card-flip.mp3'),
  diceRoll: require('@/assets/sounds/dice-roll.mp3'),
  goal: require('@/assets/sounds/goal.mp3'),
  whistle: require('@/assets/sounds/whistle.mp3'),
  victory: require('@/assets/sounds/victory.mp3'),
  defeat: require('@/assets/sounds/defeat.mp3'),
  timerWarning: require('@/assets/sounds/timer-warning.mp3'),
  backgroundMusic: require('@/assets/sounds/background-music.mp3'),
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const sounds = useRef<SoundMap>({});
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Configurer l'audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });

    // Précharger les sons
    // TODO: Uncomment when sound files are added
    // preloadSounds();

    return () => {
      // Nettoyer les sons
      Object.values(sounds.current).forEach(sound => {
        sound.unloadAsync();
      });
      if (backgroundMusic.current) {
        backgroundMusic.current.unloadAsync();
      }
    };
  }, []);

  const preloadSounds = async () => {
    try {
      for (const [name, asset] of Object.entries(soundAssets)) {
        if (name !== 'backgroundMusic') {
          const { sound } = await Audio.Sound.createAsync(asset);
          sounds.current[name] = sound;
        }
      }
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  };

  const playSound = async (soundName: string) => {
    if (!settings.sound) return;

    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  const stopSound = async (soundName: string) => {
    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.error(`Error stopping sound ${soundName}:`, error);
    }
  };

  const playBackgroundMusic = async () => {
    if (!settings.sound) return;

    try {
      if (!backgroundMusic.current) {
        const { sound } = await Audio.Sound.createAsync(
          soundAssets.backgroundMusic,
          { isLooping: true, volume: 0.3 }
        );
        backgroundMusic.current = sound;
      }
      await backgroundMusic.current.playAsync();
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (backgroundMusic.current) {
        await backgroundMusic.current.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  };

  const setSoundVolume = async (volume: number) => {
    try {
      // Définir le volume pour tous les sons
      for (const sound of Object.values(sounds.current)) {
        await sound.setVolumeAsync(volume);
      }
      if (backgroundMusic.current) {
        await backgroundMusic.current.setVolumeAsync(volume * 0.3); // Musique de fond plus basse
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const value: SoundContextValue = {
    playSound,
    stopSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    setSoundVolume,
    preloadSounds,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}