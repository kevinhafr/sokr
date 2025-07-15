# Rocket Footy - Configuration

## 1. Configuration d'Environnement

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Expo Public (accessible côté client)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://api.rocketfooty.com
EXPO_PUBLIC_WS_URL=wss://api.rocketfooty.com

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Sentry
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN=xxx
EXPO_PUBLIC_GA_TRACKING_ID=G-XXX

# Push Notifications
EXPO_PUBLIC_ONESIGNAL_APP_ID=xxx

# Environment
NODE_ENV=development
```

```bash
# .env.production
NODE_ENV=production
EXPO_PUBLIC_API_URL=https://api.rocketfooty.com
EXPO_PUBLIC_WS_URL=wss://api.rocketfooty.com

# Production keys...
```

## 2. Configuration TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@contexts/*": ["src/contexts/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@navigation/*": ["src/navigation/*"],
      "@assets/*": ["assets/*"]
    }
  },
  "include": [
    "src/**/*",
    "types/**/*",
    "*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

## 3. Configuration Expo

```json
// app.json
{
  "expo": {
    "name": "Rocket Footy",
    "slug": "rocket-footy",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a472a"
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/xxx"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rocketfooty.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to scan QR codes.",
        "NSPhotoLibraryUsageDescription": "This app needs access to photo library to save images."
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a472a"
      },
      "package": "com.rocketfooty.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "VIBRATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-camera",
      "expo-image-picker",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 33,
            "targetSdkVersion": 33,
            "buildToolsVersion": "33.0.0"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "xxx"
      }
    }
  }
}
```

## 4. Configuration EAS Build

```json
// eas.json
{
  "cli": {
    "version": ">= 3.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production",
        "API_URL": "https://staging-api.rocketfooty.com"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "NODE_ENV": "production",
        "API_URL": "https://api.rocketfooty.com"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./pc-api-xxx.json",
        "track": "production"
      },
      "ios": {
        "appleId": "xxx@company.com",
        "ascAppId": "xxx",
        "appleTeamId": "XXX"
      }
    }
  }
}
```

## 5. Configuration Babel

```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
            '@navigation': './src/navigation',
            '@assets': './assets'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
```

## 6. Configuration Metro

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuration personnalisée
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db'],
};

module.exports = config;
```

## 7. Configuration App

```typescript
// config/app.config.ts
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
```

## 8. Configuration des Thèmes

```typescript
// config/theme.config.ts
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
    // Les autres propriétés restent identiques
    spacing: { /* ... */ },
    typography: { /* ... */ },
    borderRadius: { /* ... */ },
    shadows: { /* ... */ },
  },
};

export type Theme = typeof themeConfig.light;
export type ThemeColor = keyof Theme['colors'];
export type ThemeSpacing = keyof Theme['spacing'];
```

## 9. Configuration Analytics

```typescript
// config/analytics.config.ts
export const analyticsConfig = {
  mixpanel: {
    token: process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '',
    trackAutomaticEvents: true,
    flushInterval: 60000, // 1 minute
  },
  
  firebase: {
    enabled: true,
    logLevel: __DEV__ ? 'verbose' : 'error',
  },
  
  sentry: {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    attachScreenshot: true,
    attachViewHierarchy: true,
  },
  
  // Événements personnalisés à tracker
  events: {
    // Auth
    AUTH_LOGIN: 'auth_login',
    AUTH_REGISTER: 'auth_register',
    AUTH_LOGOUT: 'auth_logout',
    
    // Game
    GAME_START: 'game_start',
    GAME_END: 'game_end',
    GAME_FORFEIT: 'game_forfeit',
    MOVE_MADE: 'move_made',
    CARD_PLACED: 'card_placed',
    BONUS_USED: 'bonus_used',
    
    // Deck
    DECK_CREATED: 'deck_created',
    DECK_EDITED: 'deck_edited',
    DECK_DELETED: 'deck_deleted',
    
    // Shop
    SHOP_VIEWED: 'shop_viewed',
    PACK_PURCHASED: 'pack_purchased',
    PACK_OPENED: 'pack_opened',
    
    // UI
    SCREEN_VIEWED: 'screen_viewed',
    BUTTON_CLICKED: 'button_clicked',
    ERROR_OCCURRED: 'error_occurred',
  },
};
```

## 10. Configuration des Constantes

```typescript
// config/constants.ts

// Constantes de jeu
export const GAME_CONSTANTS = {
  TURN_DURATION: 45, // secondes
  MAX_TURNS: 10,
  HALF_TIME_TURN: 5,
  MIN_DECK_SIZE: 8,
  MAX_DECK_SIZE: 8,
  
  // Contraintes de deck
  DECK_CONSTRAINTS: {
    MAX_CP: 20,
    MIN_GOALKEEPERS: 1,
    MAX_GOALKEEPERS: 1,
    MIN_DEFENDERS: 2,
    MIN_MIDFIELDERS: 2,
    MIN_ATTACKERS: 2,
    MAX_UNIQUE: 1,
    MAX_SUPER_RARE: 2,
    MAX_RARE: 3,
  },
  
  // Points d'XP
  XP_REWARDS: {
    PARTICIPATION: 10,
    VICTORY: 5,
    GOAL: 15,
    ASSIST: 15,
    DUEL_WON: 5,
    ACTION_SUCCESS: 2,
    CRITICAL: 3,
  },
  
  // Niveaux d'XP requis
  XP_LEVELS: [0, 100, 250, 500, 1000],
};

// Constantes de rareté
export const RARITY_CONSTANTS = {
  COPIES: {
    Common: 10000,
    Limited: 1000,
    Rare: 100,
    SuperRare: 10,
    Unique: 1,
  },
  
  STAT_LIMITS: {
    Common: 3,
    Limited: 3,
    Rare: 4,
    SuperRare: 5,
    Unique: 5,
  },
  
  BONUSES: {
    Common: 0,
    Limited: 0,
    Rare: 1,
    SuperRare: 1,
    Unique: 2,
  },
  
  COLORS: {
    Common: '#B0BEC5',
    Limited: '#81C784',
    Rare: '#64B5F6',
    SuperRare: '#BA68C8',
    Unique: '#FFD54F',
  },
};

// Constantes de matchmaking
export const MATCHMAKING_CONSTANTS = {
  MMR_RANGE: 100,
  TIMEOUT: 45000, // 45 secondes
  STARTING_MMR: 1000,
  K_FACTOR: 32, // Pour le calcul ELO
};

// Constantes d'erreur
export const ERROR_CODES = {
  AUTH_INVALID_CREDENTIALS: 'AUTH001',
  AUTH_USER_NOT_FOUND: 'AUTH002',
  AUTH_USER_BANNED: 'AUTH003',
  
  GAME_NOT_FOUND: 'GAME001',
  GAME_NOT_YOUR_TURN: 'GAME002',
  GAME_INVALID_ACTION: 'GAME003',
  GAME_TIMEOUT: 'GAME004',
  
  DECK_INVALID: 'DECK001',
  DECK_CP_EXCEEDED: 'DECK002',
  DECK_COMPOSITION_INVALID: 'DECK003',
  
  NETWORK_ERROR: 'NET001',
  SERVER_ERROR: 'SRV001',
  UNKNOWN_ERROR: 'UNK001',
};

// Constantes de regex
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// URLs
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  GAME: {
    CREATE: '/games/create',
    JOIN: '/games/join',
    MOVE: '/games/move',
    FORFEIT: '/games/forfeit',
  },
  DECK: {
    LIST: '/decks',
    CREATE: '/decks/create',
    UPDATE: '/decks/update',
    DELETE: '/decks/delete',
  },
  SHOP: {
    PACKS: '/shop/packs',
    PURCHASE: '/shop/purchase',
    OPEN: '/shop/open',
  },
};
```

## 11. Configuration des Tests

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],
};
```

```javascript
// jest.setup.js
import '@testing-library/jest-native/extend-expect';
import { mockAsyncStorage } from './src/utils/test-helpers';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage());

// Mock des modules natifs
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  vibrate: jest.fn(),
  cancel: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

// Mock de Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

// Configuration globale
global.__DEV__ = true;
```