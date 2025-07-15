// types/realtime.ts
export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: number;
  playerId?: string;
}

export interface StateUpdate {
  type: 'DB_UPDATE' | 'FSM_TRANSITION' | 'FORCE_SYNC';
  table?: string;
  new?: any;
  old?: any;
  timestamp: number;
}

export interface GameEvent {
  type: 'ACTION' | 'NEW_MOVE' | 'CARD_PLACED' | 'SYSTEM_ALERT';
  move?: any;
  placement?: any;
  alert?: any;
  timestamp: number;
}

export interface PlayerStatus {
  type: 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'PRESENCE_SYNC' | 'DISCONNECTED';
  playerId?: string;
  players?: string[];
  count?: number;
  timestamp: number;
}

export interface ChannelMessage {
  type: 'broadcast';
  event: string;
  payload: any;
}

export interface SyncState {
  lastSync: number;
  pendingUpdates: number;
  connected: boolean;
  error?: Error;
}