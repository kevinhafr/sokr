import { PlayerCard, Game } from './models';
import { GameStatus } from './base';

// Utilitaires de types génériques
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export type ValueOf<T> = T[keyof T];
export type Entries<T> = [keyof T, T[keyof T]][];

// Helper pour Redux actions
export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : { type: Key; payload: M[Key] }
};

// Type Guards
export function isPlayerCard(obj: any): obj is PlayerCard {
  return obj && typeof obj.id === 'string' && obj.position && obj.rarity;
}

export function isGameActive(game: Game | null): boolean {
  if (!game) return false;
  const activeStatuses: GameStatus[] = [
    'active', 
    'activeTurnA', 
    'activeTurnB', 
    'placement',
    'placementTeamA',
    'placementTeamB'
  ];
  return activeStatuses.includes(game.status);
}

export function isPlayerTurn(game: Game | null, playerId: string): boolean {
  if (!game || !isGameActive(game)) return false;
  return game.current_player === playerId;
}