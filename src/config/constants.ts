// config/constants.ts

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