import Constants from 'expo-constants';

interface AppConfig {
  api: {
    baseUrl: string;
    wsUrl: string;
    timeout: number;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  game: {
    turnDuration: number;
    maxTurns: number;
    boardSize: {
      zones: number;
      cellsPerZone: number;
    };
    matchmaking: {
      timeout: number;
      mmrRange: number;
    };
  };
  storage: {
    cacheExpiry: number;
    maxCacheSize: number;
  };
  ui: {
    animationDuration: number;
    toastDuration: number;
  };
}

const config: AppConfig = {
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
    timeout: 30000,
  },
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  game: {
    turnDuration: 45, // secondes
    maxTurns: 10,
    boardSize: {
      zones: 5, // G1, Z1, Z2, Z3, G2
      cellsPerZone: 3,
    },
    matchmaking: {
      timeout: 45000, // 45 secondes
      mmrRange: 100,
    },
  },
  storage: {
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 50 * 1024 * 1024, // 50MB
  },
  ui: {
    animationDuration: 300,
    toastDuration: 3000,
  },
};

export default config;

// Helper pour accéder à la config
export const getConfig = (): AppConfig => config;

// Helper pour vérifier l'environnement
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// Version de l'app
export const appVersion = Constants.manifest?.version || '1.0.0';
export const buildNumber = Constants.manifest?.ios?.buildNumber || 
                          Constants.manifest?.android?.versionCode || '1';