import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Fonction pour obtenir l'IP locale de votre machine
const getLocalIP = () => {
  // IP de votre machine sur le réseau local
  return '10.0.0.32';
};

const isDevelopment = __DEV__;
const isExpoGo = Constants.appOwnership === 'expo';

export const getSupabaseUrl = () => {
  if (!isDevelopment) {
    return process.env.EXPO_PUBLIC_SUPABASE_URL!;
  }

  // En développement
  if (Platform.OS === 'web') {
    return 'http://localhost:54321';
  }

  // Sur mobile (iOS/Android)
  if (isExpoGo) {
    // Expo Go sur un appareil physique
    return `http://${getLocalIP()}:54321`;
  }

  // Émulateur Android
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:54321';
  }

  // Simulateur iOS ou appareil physique
  return `http://${getLocalIP()}:54321`;
};

export const getApiUrl = () => {
  if (!isDevelopment) {
    return process.env.EXPO_PUBLIC_API_URL!;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  if (isExpoGo) {
    return `http://${getLocalIP()}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return `http://${getLocalIP()}:3000`;
};

export const getWsUrl = () => {
  if (!isDevelopment) {
    return process.env.EXPO_PUBLIC_WS_URL!;
  }

  if (Platform.OS === 'web') {
    return 'ws://localhost:3000';
  }

  if (isExpoGo) {
    return `ws://${getLocalIP()}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:3000';
  }

  return `ws://${getLocalIP()}:3000`;
};