# Rocket Footy - Utils & Helpers

## 1. Helpers de Validation

```typescript
// utils/validation.ts

export const ValidationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^.{8,}$/,
  deckName: /^.{3,30}$/,
};

export const validateEmail = (email: string): boolean => {
  return ValidationRules.email.test(email);
};

export const validateUsername = (username: string): boolean => {
  return ValidationRules.username.test(username);
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDeckName = (name: string): boolean => {
  return ValidationRules.deckName.test(name.trim());
};

export const validateDeckComposition = (deck: string[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (deck.length !== 8) {
    errors.push('Le deck doit contenir exactement 8 cartes');
  }
  
  // Vérifier les duplicatas
  const uniqueCards = new Set(deck);
  if (uniqueCards.size !== deck.length) {
    errors.push('Le deck contient des cartes en double');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

## 2. Helpers de Formatage

```typescript
// utils/formatting.ts

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(d);
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'À l\'instant';
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};
```

## 3. Helpers de Cartes

```typescript
// utils/cards.ts
import { PlayerCard, UserPlayer, CardRarity } from '@/types';

export const getRarityColor = (rarity: CardRarity): string => {
  switch (rarity) {
    case 'Common':
      return '#B0BEC5';
    case 'Limited':
      return '#81C784';
    case 'Rare':
      return '#64B5F6';
    case 'SuperRare':
      return '#BA68C8';
    case 'Unique':
      return '#FFD54F';
    default:
      return '#FFFFFF';
  }
};

export const getRarityBonus = (rarity: CardRarity): number => {
  switch (rarity) {
    case 'Common':
    case 'Limited':
      return 0;
    case 'Rare':
    case 'SuperRare':
      return 1;
    case 'Unique':
      return 2;
    default:
      return 0;
  }
};

export const getPositionAbbreviation = (position: string): string => {
  switch (position) {
    case 'gardien':
      return 'GK';
    case 'defenseur':
      return 'DEF';
    case 'milieu':
      return 'MID';
    case 'attaquant':
      return 'ATT';
    default:
      return '?';
  }
};

export const getPositionColor = (position: string): string => {
  switch (position) {
    case 'gardien':
      return '#FFC107';
    case 'defenseur':
      return '#2196F3';
    case 'milieu':
      return '#4CAF50';
    case 'attaquant':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

export const calculateCardPower = (card: PlayerCard): number => {
  return card.shot + card.dribble + card.pass + card.block;
};

export const calculateCardEfficiency = (card: PlayerCard): number => {
  const power = calculateCardPower(card);
  return power / card.cp_cost;
};

export const getStatForAction = (
  card: PlayerCard,
  action: string,
  side: 'attack' | 'defense'
): number => {
  if (side === 'attack') {
    switch (action) {
      case 'shot':
        return card.shot;
      case 'pass':
        return card.pass;
      case 'dribble':
        return card.dribble;
      default:
        return 0;
    }
  } else {
    switch (action) {
      case 'shot':
        return card.position === 'gardien' ? card.block : 0;
      case 'pass':
      case 'dribble':
        return card.block;
      default:
        return 0;
    }
  }
};

export const getUpgradedStat = (
  baseStat: number,
  upgrades: Record<string, number>,
  statName: string
): number => {
  return baseStat + (upgrades[statName] || 0);
};

export const getRequiredXP = (currentLevel: number): number => {
  const xpTable = [0, 100, 250, 500, 1000];
  return xpTable[currentLevel] || 9999;
};

export const canLevelUp = (userCard: UserPlayer): boolean => {
  const requiredXP = getRequiredXP(userCard.level);
  return userCard.xp >= requiredXP;
};

export const getMaxLevel = (rarity: CardRarity): number => {
  switch (rarity) {
    case 'Common':
    case 'Limited':
      return 3;
    case 'Rare':
      return 4;
    case 'SuperRare':
    case 'Unique':
      return 5;
    default:
      return 3;
  }
};
```

## 4. Helpers de Jeu

```typescript
// utils/game.ts
import { Game, BoardPosition, BoardState } from '@/types';

export const getZoneFromPosition = (position: BoardPosition): string => {
  if (position.startsWith('G')) return position;
  return position.substring(0, 2); // Z1, Z2, Z3
};

export const getAdjacentPositions = (position: BoardPosition): BoardPosition[] => {
  const adjacency: Record<BoardPosition, BoardPosition[]> = {
    'G1': ['Z1-1', 'Z1-2', 'Z1-3'],
    'Z1-1': ['G1', 'Z1-2', 'Z1-3', 'Z2-1', 'Z2-2'],
    'Z1-2': ['G1', 'Z1-1', 'Z1-3', 'Z2-1', 'Z2-2', 'Z2-3'],
    'Z1-3': ['G1', 'Z1-1', 'Z1-2', 'Z2-2', 'Z2-3'],
    'Z2-1': ['Z1-1', 'Z1-2', 'Z2-2', 'Z2-3', 'Z3-1', 'Z3-2'],
    'Z2-2': ['Z1-1', 'Z1-2', 'Z1-3', 'Z2-1', 'Z2-3', 'Z3-1', 'Z3-2', 'Z3-3'],
    'Z2-3': ['Z1-2', 'Z1-3', 'Z2-1', 'Z2-2', 'Z3-2', 'Z3-3'],
    'Z3-1': ['Z2-1', 'Z2-2', 'Z3-2', 'Z3-3', 'G2'],
    'Z3-2': ['Z2-1', 'Z2-2', 'Z2-3', 'Z3-1', 'Z3-3', 'G2'],
    'Z3-3': ['Z2-2', 'Z2-3', 'Z3-1', 'Z3-2', 'G2'],
    'G2': ['Z3-1', 'Z3-2', 'Z3-3'],
  };
  
  return adjacency[position] || [];
};

export const canPerformAction = (
  action: string,
  actorPosition: BoardPosition,
  ballPosition: BoardPosition,
  targetPosition?: BoardPosition
): boolean => {
  // Le joueur doit avoir la balle pour agir
  if (actorPosition !== ballPosition) return false;
  
  switch (action) {
    case 'shot':
      // Peut tirer depuis les zones d'attaque ou avec carte bonus
      const zone = getZoneFromPosition(actorPosition);
      return zone === 'Z3' || zone === 'Z1'; // Selon l'équipe
      
    case 'pass':
      // Peut passer à un coéquipier adjacent ou dans la même zone
      if (!targetPosition) return false;
      const adjacentPositions = getAdjacentPositions(actorPosition);
      const sameZone = getZoneFromPosition(actorPosition) === getZoneFromPosition(targetPosition);
      return adjacentPositions.includes(targetPosition) || sameZone;
      
    case 'dribble':
      // Peut dribbler vers une position adjacente libre
      if (!targetPosition) return false;
      return getAdjacentPositions(actorPosition).includes(targetPosition);
      
    default:
      return false;
  }
};

export const getFormationBonus = (
  boardState: BoardState,
  team: 'A' | 'B'
): Record<string, number> => {
  const bonuses = {
    shot: 0,
    pass: 0,
    block: 0,
  };
  
  // Compter les joueurs par position
  const positions = Object.values(boardState)
    .filter(cell => cell.player === team)
    .map(cell => cell.card?.position)
    .filter(Boolean);
  
  const counts = positions.reduce((acc, pos) => {
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Appliquer les bonus de formation
  if (counts.defenseur >= 2) bonuses.block = 1;
  if (counts.milieu >= 2) bonuses.pass = 1;
  if (counts.attaquant >= 2) bonuses.shot = 1;
  
  return bonuses;
};

export const calculateMMRChange = (
  winnerMMR: number,
  loserMMR: number,
  isDraw: boolean = false
): { winner: number; loser: number } => {
  const K = 32; // Facteur K
  const expectedWinner = 1 / (1 + Math.pow(10, (loserMMR - winnerMMR) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  if (isDraw) {
    return {
      winner: Math.round(K * (0.5 - expectedWinner)),
      loser: Math.round(K * (0.5 - expectedLoser)),
    };
  }
  
  return {
    winner: Math.round(K * (1 - expectedWinner)),
    loser: Math.round(K * (0 - expectedLoser)),
  };
};

export const getGameResult = (game: Game, userId: string): 'win' | 'loss' | 'draw' => {
  const isPlayerA = game.player_a === userId;
  
  if (game.score_a === game.score_b) return 'draw';
  
  const isWinner = isPlayerA 
    ? game.score_a > game.score_b 
    : game.score_b > game.score_a;
    
  return isWinner ? 'win' : 'loss';
};
```

## 5. Helpers de Sécurité

```typescript
// utils/security.ts
import CryptoJS from 'crypto-js';

export const hashPassword = (password: string, salt: string): string => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
};

export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

export const encryptData = (data: any, key: string): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, key).toString();
};

export const decryptData = (encryptedData: string, key: string): any => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
  const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonString);
};

export const generateActionHash = (action: any, timestamp: number): string => {
  const data = {
    ...action,
    timestamp,
  };
  
  return CryptoJS.SHA256(JSON.stringify(data)).toString();
};

export const verifyActionHash = (
  action: any,
  timestamp: number,
  hash: string
): boolean => {
  const calculatedHash = generateActionHash(action, timestamp);
  return calculatedHash === hash;
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Retirer les balises HTML basiques
    .replace(/javascript:/gi, '') // Retirer les tentatives d'injection JS
    .replace(/on\w+=/gi, ''); // Retirer les event handlers
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
```

## 6. Helpers de Stockage

```typescript
// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageHelper {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  static async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  static async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, any> = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }

  static async multiSet(data: Record<string, any>): Promise<boolean> {
    try {
      const pairs = Object.entries(data).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error in multiSet:', error);
      return false;
    }
  }
}

// Clés de stockage prédéfinies
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  CURRENT_DECK: 'current_deck',
  SETTINGS: 'settings',
  CACHED_CARDS: 'cached_cards',
  GAME_STATE: 'game_state',
  DRAFT_BACKUP: 'draft_backup',
  TUTORIAL_COMPLETED: 'tutorial_completed',
} as const;
```

## 7. Helpers de Performance

```typescript
// utils/performance.ts

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limiter la taille du cache
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
};

export const lazy = <T>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

export const measurePerformance = async <T>(
  name: string,
  func: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  
  try {
    const result = await func();
    const end = performance.now();
    
    console.log(`${name} took ${end - start}ms`);
    
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`${name} failed after ${end - start}ms:`, error);
    throw error;
  }
};

export const chunkedArray = <T>(
  array: T[],
  chunkSize: number
): T[][] => {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  
  return chunks;
};
```

## 8. Helpers de Test

```typescript
// utils/test-helpers.ts
import { PlayerCard, UserPlayer, Game } from '@/types';

export const createMockPlayerCard = (
  overrides: Partial<PlayerCard> = {}
): PlayerCard => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Player',
  nationality: 'FR',
  position: 'milieu',
  rarity: 'Common',
  shot: 2,
  dribble: 2,
  pass: 3,
  block: 1,
  cp_cost: 4,
  special_ability: null,
  reroll_count: 0,
  image_url: '/test-image.png',
  edition: 'base',
  ...overrides,
});

export const createMockUserPlayer = (
  overrides: Partial<UserPlayer> = {}
): UserPlayer => ({
  id: '123e4567-e89b-12d3-a456-426614174001',
  user_id: '123e4567-e89b-12d3-a456-426614174002',
  player_id: '123e4567-e89b-12d3-a456-426614174000',
  level: 1,
  xp: 0,
  total_xp: 0,
  stat_upgrades: {},
  obtained_at: new Date().toISOString(),
  games_played: 0,
  goals_scored: 0,
  assists_made: 0,
  duels_won: 0,
  ...overrides,
});

export const createMockGame = (
  overrides: Partial<Game> = {}
): Game => ({
  id: '123e4567-e89b-12d3-a456-426614174003',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'active',
  current_turn: 1,
  turn_started_at: new Date().toISOString(),
  player_a: '123e4567-e89b-12d3-a456-426614174004',
  player_b: '123e4567-e89b-12d3-a456-426614174005',
  current_player: '123e4567-e89b-12d3-a456-426614174004',
  score_a: 0,
  score_b: 0,
  game_state: {
    boardState: {},
    ballPosition: 'Z2-2',
    turn: 1,
    placementCount: {},
  },
  board_state: {},
  ball_position: 'Z2-2',
  mode: 'quick',
  ...overrides,
});

export const createMockProfile = (overrides: any = {}) => ({
  id: '123e4567-e89b-12d3-a456-426614174006',
  username: 'TestUser',
  email: 'test@example.com',
  mmr: 1000,
  total_games: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  ...overrides,
});

export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const mockAsyncStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
  };
};
```

## 9. Helpers d'Internationalisation

```typescript
// utils/i18n.ts

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

const translations = {
  fr: {
    'game.victory': 'Victoire !',
    'game.defeat': 'Défaite',
    'game.draw': 'Match nul',
    'game.your_turn': 'C\'est votre tour',
    'game.opponent_turn': 'Tour de l\'adversaire',
    'game.time_remaining': 'Temps restant: {{time}}',
    'game.score': 'Score: {{scoreA}} - {{scoreB}}',
    
    'card.level': 'Niveau {{level}}',
    'card.xp': '{{current}}/{{required}} XP',
    'card.upgrade': 'Améliorer',
    
    'deck.invalid': 'Deck invalide',
    'deck.saved': 'Deck sauvegardé',
    'deck.name_required': 'Nom requis',
    
    'auth.login': 'Connexion',
    'auth.logout': 'Déconnexion',
    'auth.register': 'Inscription',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.username': 'Nom d\'utilisateur',
    
    'error.network': 'Erreur de connexion',
    'error.unauthorized': 'Non autorisé',
    'error.server': 'Erreur serveur',
    'error.unknown': 'Une erreur est survenue',
  },
  en: {
    'game.victory': 'Victory!',
    'game.defeat': 'Defeat',
    'game.draw': 'Draw',
    'game.your_turn': 'Your turn',
    'game.opponent_turn': 'Opponent\'s turn',
    'game.time_remaining': 'Time remaining: {{time}}',
    'game.score': 'Score: {{scoreA}} - {{scoreB}}',
    
    'card.level': 'Level {{level}}',
    'card.xp': '{{current}}/{{required}} XP',
    'card.upgrade': 'Upgrade',
    
    'deck.invalid': 'Invalid deck',
    'deck.saved': 'Deck saved',
    'deck.name_required': 'Name required',
    
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
    
    'error.network': 'Network error',
    'error.unauthorized': 'Unauthorized',
    'error.server': 'Server error',
    'error.unknown': 'An error occurred',
  },
};

let currentLocale = 'fr';

export const setLocale = (locale: string) => {
  if (translations[locale]) {
    currentLocale = locale;
  }
};

export const t = (
  key: TranslationKey,
  params?: TranslationParams
): string => {
  const translation = translations[currentLocale]?.[key] || key;
  
  if (!params) return translation;
  
  return Object.entries(params).reduce(
    (result, [paramKey, paramValue]) => {
      return result.replace(`{{${paramKey}}}`, String(paramValue));
    },
    translation
  );
};

export const getAvailableLocales = (): string[] => {
  return Object.keys(translations);
};

export const getCurrentLocale = (): string => {
  return currentLocale;
};
```

## 10. Helpers de Navigation

```typescript
// utils/navigation.ts
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';

let navigator: NavigationContainerRef<RootStackParamList>;

export const setTopLevelNavigator = (
  navigatorRef: NavigationContainerRef<RootStackParamList>
) => {
  navigator = navigatorRef;
};

export const navigate = (
  routeName: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList]
) => {
  if (navigator) {
    navigator.navigate(routeName, params);
  }
};

export const goBack = () => {
  if (navigator && navigator.canGoBack()) {
    navigator.goBack();
  }
};

export const replace = (
  routeName: keyof RootStackParamList,
  params?: RootStackParamList[keyof RootStackParamList]
) => {
  if (navigator) {
    navigator.reset({
      index: 0,
      routes: [{ name: routeName, params }],
    });
  }
};

export const getCurrentRoute = (): string | undefined => {
  if (navigator) {
    return navigator.getCurrentRoute()?.name;
  }
};

export const canGoBack = (): boolean => {
  return navigator?.canGoBack() || false;
};

// Deep linking
export const getDeepLinkConfig = () => ({
  prefixes: ['rocketfooty://', 'https://rocketfooty.com'],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Collection: 'collection',
          Shop: 'shop',
          Profile: 'profile/:userId?',
          Leaderboard: 'leaderboard',
        },
      },
      Game: 'game/:gameId',
      DeckBuilder: 'deck/:deckId?',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
});
```