import { GameStatus, BoardPosition, ActionType } from './base';
import { GameState, Move } from './models';

export type GameEvent = 
  | { type: 'PLAYER_JOINED'; playerId: string; timestamp: number }
  | { type: 'PLAYER_LEFT'; playerId: string; reason: string; timestamp: number }
  | { type: 'COIN_TOSS_COMPLETE'; winner: string; timestamp: number }
  | { type: 'PLACEMENT_COMPLETE'; playerId: string; position: BoardPosition; cardId: string; timestamp: number }
  | { type: 'TURN_START'; turnNumber: number; currentPlayer: string; timestamp: number }
  | { type: 'ACTION_COMPLETE'; action: ActionType; success: boolean; timestamp: number }
  | { type: 'GOAL_SCORED'; scorer: string; assist?: string; timestamp: number }
  | { type: 'HALF_TIME'; score: { teamA: number; teamB: number }; timestamp: number }
  | { type: 'GAME_END'; winner: string; finalScore: { teamA: number; teamB: number }; timestamp: number };

export type RealtimeEvent = 
  | { type: 'STATE_UPDATE'; state: GameState; timestamp: number }
  | { type: 'GAME_EVENT'; event: GameEvent; timestamp: number }
  | { type: 'PLAYER_STATUS'; event: PlayerStatusEvent; timestamp: number }
  | { type: 'SYSTEM_ALERT'; alert: SystemAlert; timestamp: number };

export interface PlayerStatusEvent {
  type: 'online' | 'offline' | 'reconnecting';
  playerId?: string;
  players?: Array<{ id: string; status: 'online' | 'offline' }>;
  timestamp: number;
}

export interface SystemAlert {
  type: 'maintenance' | 'update' | 'error';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
}