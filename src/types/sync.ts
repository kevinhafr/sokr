export interface SyncUpdate {
  type: 'SCORE_UPDATE' | 'BALL_POSITION' | 'TURN_UPDATE' | 'STATE_TRANSITION';
  timestamp: number;
  data: any;
}

export interface SyncConflict {
  localState: any;
  remoteState: any;
  resolution: 'local' | 'remote' | 'merge';
}

export interface SyncStatus {
  lastSync: number;
  pendingUpdates: number;
  conflicts: SyncConflict[];
  connected: boolean;
}