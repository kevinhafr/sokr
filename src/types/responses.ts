import { Game, GameState, Move, Placement, SavedDeck, PlayerCard } from './models';
import { PlayerPosition, CardRarity } from './base';

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface CreateGameResponse {
  game: Game;
  inviteCode?: string;
}

export interface JoinGameResponse {
  game: Game;
  action: 'joined' | 'created';
  timeout?: number;
}

export interface MakeMoveResponse {
  move: Move;
  gameState: GameState;
  xpGained: Record<string, number>;
}

export interface PlaceCardResponse {
  placement: Placement;
  nextPlayer: string;
}

export interface ValidateDeckResponse {
  valid: boolean;
  deck?: SavedDeck;
  totalCP?: number;
  composition?: {
    positions: Record<PlayerPosition, number>;
    rarities: Record<CardRarity, number>;
  };
  error?: string;
  details?: any;
}

export interface OpenPackResponse {
  cards: PlayerCard[];
  bonusApplied: boolean;
}

export interface MatchmakeResponse {
  game: Game;
  action: 'joined' | 'created';
  timeout?: number;
}