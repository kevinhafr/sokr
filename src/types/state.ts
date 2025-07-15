import { User, Profile, Game, Move, Placement, UserPlayer, SavedDeck, BonusCard } from './models';
import { GameStatus, BoardState, BoardPosition, PlayerPosition, CardRarity } from './base';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AppState {
  auth: AuthState;
  game: GameStateType;
  deck: DeckState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export interface GameStateType {
  currentGame: Game | null;
  gameStatus: GameStatus;
  board: BoardState;
  ballPosition: BoardPosition;
  currentTurn: number;
  currentPlayer: string | null;
  scores: {
    teamA: number;
    teamB: number;
  };
  moves: Move[];
  placements: Placement[];
  isLoading: boolean;
  error: Error | null;
  realtime: {
    channel: RealtimeChannel | null;
    connected: boolean;
  };
}

export interface DeckState {
  userCards: UserPlayer[];
  currentDeck: string[]; // Array of player IDs
  savedDecks: SavedDeck[];
  bonusCard: BonusCard | null;
  isValidDeck: boolean;
  totalCP: number;
  composition: {
    positions: Record<PlayerPosition, number>;
    rarities: Record<CardRarity, number>;
  };
}

export interface UIState {
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
}