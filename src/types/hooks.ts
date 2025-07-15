import { Game, Move, Placement, SavedDeck, UserPlayer, BonusCard, User, Profile } from './models';
import { ActionType, BoardPosition } from './base';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UseGameReturn {
  game: Game | null;
  isLoading: boolean;
  error: Error | null;
  makeMove: (action: ActionType, actorPosition: BoardPosition, targetPosition?: BoardPosition) => Promise<Move>;
  placeCard: (cardId: string, position: BoardPosition) => Promise<Placement>;
  forfeit: () => Promise<void>;
}

export interface UseDeckReturn {
  deck: string[];
  bonusCard: BonusCard | null;
  isValid: boolean;
  totalCP: number;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  saveDeck: (name: string) => Promise<SavedDeck>;
  loadDeck: (deckId: string) => Promise<void>;
}

export interface UseRealtimeReturn {
  connected: boolean;
  players: Array<{ id: string; status: 'online' | 'offline' }>;
  error: Error | null;
  sendAction: (action: any) => void;
  requestSync: () => void;
}

export interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}