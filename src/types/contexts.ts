// types/contexts.ts
import { Game, Move, Placement, GameState } from './index';

export interface GameContextValue {
  currentGame: Game | null;
  gameState: GameState | null;
  moves: Move[];
  placements: Placement[];
  isLoading: boolean;
  error: Error | null;
  isMyTurn: boolean;
  timeRemaining: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  joinGame: (gameId: string) => Promise<void>;
  leaveGame: () => Promise<void>;
  makeMove: (move: Omit<Move, 'id' | 'game_id' | 'created_at'>) => Promise<void>;
  placePieces: (placement: Omit<Placement, 'id' | 'game_id' | 'created_at'>) => Promise<void>;
  updateTimeRemaining: (time: number) => void;
  syncGameState: () => Promise<void>;
}