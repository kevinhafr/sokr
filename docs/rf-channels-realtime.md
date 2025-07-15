# Rocket Footy - Channels Supabase Realtime

## Vue d'ensemble

Le système Realtime utilise les channels Supabase pour synchroniser l'état du jeu entre les joueurs. Chaque partie a son propre channel avec des événements spécifiques.

## Architecture des Channels

```
game:{gameId}
├── state_updates    // Changements d'état FSM
├── game_events     // Actions de jeu
├── player_status   // Connexion/déconnexion
├── chat_messages   // Messages optionnels (future feature)
└── system_alerts   // Timeouts, abandons
```

## 1. GameChannel Manager

```typescript
// lib/channels/GameChannelManager.ts
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface GameChannelConfig {
  gameId: string;
  userId: string;
  onStateUpdate: (state: any) => void;
  onGameEvent: (event: any) => void;
  onPlayerStatus: (status: any) => void;
  onError: (error: any) => void;
}

export class GameChannelManager {
  private channel: RealtimeChannel | null = null;
  private gameId: string;
  private userId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private presenceRef: any = null;

  constructor(private config: GameChannelConfig) {
    this.gameId = config.gameId;
    this.userId = config.userId;
  }

  async connect() {
    try {
      // Créer le channel unique pour cette partie
      this.channel = supabase.channel(`game:${this.gameId}`, {
        config: {
          presence: {
            key: this.userId
          },
          broadcast: {
            self: false // Ne pas recevoir ses propres broadcasts
          }
        }
      });

      // 1. Écouter les changements de la table games
      this.channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${this.gameId}`
        },
        this.handleDatabaseChange.bind(this)
      );

      // 2. Écouter les changements de la table moves
      this.channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves',
          filter: `game_id=eq.${this.gameId}`
        },
        this.handleMoveInsert.bind(this)
      );

      // 3. Écouter les changements de placements
      this.channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'placements',
          filter: `game_id=eq.${this.gameId}`
        },
        this.handlePlacementInsert.bind(this)
      );

      // 4. Écouter les événements broadcast
      this.setupBroadcastListeners();

      // 5. Gérer la présence
      this.setupPresenceListeners();

      // S'abonner au channel
      await this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Connected to game channel:', this.gameId);
          this.reconnectAttempts = 0;
          
          // Annoncer notre présence
          this.presenceRef = this.channel!.track({
            user_id: this.userId,
            online_at: new Date().toISOString(),
            device: this.getDeviceInfo()
          });
        } else if (status === 'CLOSED') {
          this.handleDisconnection();
        } else if (status === 'CHANNEL_ERROR') {
          this.config.onError(new Error('Channel error'));
          this.handleReconnection();
        }
      });

    } catch (error) {
      this.config.onError(error);
      this.handleReconnection();
    }
  }

  private setupBroadcastListeners() {
    // Actions de jeu
    this.channel!.on(
      'broadcast',
      { event: 'game_action' },
      ({ payload }) => {
        this.config.onGameEvent({
          type: 'ACTION',
          ...payload
        });
      }
    );

    // Changements d'état FSM
    this.channel!.on(
      'broadcast',
      { event: 'state_transition' },
      ({ payload }) => {
        this.config.onStateUpdate({
          type: 'FSM_TRANSITION',
          ...payload
        });
      }
    );

    // Alerts système (timeouts, abandons)
    this.channel!.on(
      'broadcast',
      { event: 'system_alert' },
      ({ payload }) => {
        this.config.onGameEvent({
          type: 'SYSTEM_ALERT',
          ...payload
        });
      }
    );

    // Synchronisation forcée
    this.channel!.on(
      'broadcast',
      { event: 'force_sync' },
      ({ payload }) => {
        this.config.onStateUpdate({
          type: 'FORCE_SYNC',
          ...payload
        });
      }
    );
  }

  private setupPresenceListeners() {
    // Synchronisation de présence
    this.channel!.on('presence', { event: 'sync' }, () => {
      const state = this.channel!.presenceState();
      this.handlePresenceSync(state);
    });

    // Joueur rejoint
    this.channel!.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      this.config.onPlayerStatus({
        type: 'PLAYER_JOINED',
        playerId: key,
        timestamp: Date.now(),
        presences: newPresences
      });
    });

    // Joueur quitte
    this.channel!.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      this.config.onPlayerStatus({
        type: 'PLAYER_LEFT',
        playerId: key,
        timestamp: Date.now(),
        presences: leftPresences
      });
    });
  }

  private handleDatabaseChange(payload: RealtimePostgresChangesPayload<any>) {
    switch (payload.eventType) {
      case 'UPDATE':
        this.config.onStateUpdate({
          type: 'DB_UPDATE',
          table: 'games',
          new: payload.new,
          old: payload.old,
          timestamp: Date.now()
        });
        break;
      case 'DELETE':
        this.config.onGameEvent({
          type: 'GAME_DELETED',
          timestamp: Date.now()
        });
        break;
    }
  }

  private handleMoveInsert(payload: RealtimePostgresChangesPayload<any>) {
    this.config.onGameEvent({
      type: 'NEW_MOVE',
      move: payload.new,
      timestamp: Date.now()
    });
  }

  private handlePlacementInsert(payload: RealtimePostgresChangesPayload<any>) {
    this.config.onGameEvent({
      type: 'CARD_PLACED',
      placement: payload.new,
      timestamp: Date.now()
    });
  }

  private handlePresenceSync(state: any) {
    const players = Object.keys(state);
    const details = Object.values(state).flat();
    
    this.config.onPlayerStatus({
      type: 'PRESENCE_SYNC',
      players,
      count: players.length,
      details,
      timestamp: Date.now()
    });
  }

  private handleDisconnection() {
    console.warn('Disconnected from game channel');
    this.config.onPlayerStatus({
      type: 'DISCONNECTED',
      timestamp: Date.now()
    });
    this.handleReconnection();
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.config.onError(new Error('Max reconnection attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.disconnect();
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.presenceRef) {
      this.channel?.untrack(this.presenceRef);
    }
    
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  // Méthodes pour envoyer des événements
  async sendAction(action: any) {
    if (!this.channel) throw new Error('Channel not connected');

    const response = await this.channel.send({
      type: 'broadcast',
      event: 'game_action',
      payload: {
        playerId: this.userId,
        action,
        timestamp: Date.now()
      }
    });

    if (response !== 'ok') {
      throw new Error('Failed to send action');
    }
  }

  async sendStateTransition(transition: any) {
    if (!this.channel) throw new Error('Channel not connected');

    const response = await this.channel.send({
      type: 'broadcast',
      event: 'state_transition',
      payload: {
        ...transition,
        timestamp: Date.now()
      }
    });

    if (response !== 'ok') {
      throw new Error('Failed to send state transition');
    }
  }

  async sendSystemAlert(alert: any) {
    if (!this.channel) throw new Error('Channel not connected');

    const response = await this.channel.send({
      type: 'broadcast',
      event: 'system_alert',
      payload: {
        ...alert,
        timestamp: Date.now()
      }
    });

    if (response !== 'ok') {
      throw new Error('Failed to send alert');
    }
  }

  async requestForceSync() {
    if (!this.channel) throw new Error('Channel not connected');

    const response = await this.channel.send({
      type: 'broadcast',
      event: 'force_sync',
      payload: {
        requestedBy: this.userId,
        timestamp: Date.now()
      }
    });

    if (response !== 'ok') {
      throw new Error('Failed to request sync');
    }
  }

  // Helpers
  private getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}
```

## 2. Hook useGameChannel

```typescript
// hooks/useGameChannel.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { GameChannelManager } from '@/lib/channels/GameChannelManager';
import { useGameContext } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';

interface UseGameChannelReturn {
  connected: boolean;
  players: string[];
  error: Error | null;
  sendMove: (move: any) => Promise<void>;
  sendCardPlacement: (placement: any) => Promise<void>;
  requestSync: () => Promise<void>;
}

export function useGameChannel(gameId: string): UseGameChannelReturn {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<GameChannelManager | null>(null);
  
  const { dispatch: gameDispatch } = useGameContext();
  const { user } = useAuth();

  useEffect(() => {
    if (!gameId || !user?.id) return;

    const manager = new GameChannelManager({
      gameId,
      userId: user.id,
      onStateUpdate: (state) => {
        gameDispatch({
          type: 'REALTIME_STATE_UPDATE',
          payload: state
        });
      },
      onGameEvent: (event) => {
        gameDispatch({
          type: 'REALTIME_GAME_EVENT',
          payload: event
        });
      },
      onPlayerStatus: (status) => {
        if (status.type === 'PRESENCE_SYNC') {
          setPlayers(status.players);
        }
        
        gameDispatch({
          type: 'REALTIME_PLAYER_STATUS',
          payload: status
        });

        // Mise à jour du statut de connexion
        if (status.type === 'DISCONNECTED') {
          setConnected(false);
        }
      },
      onError: (error) => {
        console.error('Channel error:', error);
        setError(error);
        setConnected(false);
      }
    });

    managerRef.current = manager;
    
    manager.connect()
      .then(() => {
        setConnected(true);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setConnected(false);
      });

    return () => {
      manager.disconnect();
    };
  }, [gameId, user?.id, gameDispatch]);

  const sendMove = useCallback(async (move: any) => {
    if (!managerRef.current) {
      throw new Error('Channel not ready');
    }

    await managerRef.current.sendAction({
      type: 'MOVE',
      move,
      playerId: user?.id
    });
  }, [user?.id]);

  const sendCardPlacement = useCallback(async (placement: any) => {
    if (!managerRef.current) {
      throw new Error('Channel not ready');
    }

    await managerRef.current.sendAction({
      type: 'PLACE_CARD',
      placement,
      playerId: user?.id
    });
  }, [user?.id]);

  const requestSync = useCallback(async () => {
    if (!managerRef.current) {
      throw new Error('Channel not ready');
    }

    await managerRef.current.requestForceSync();
  }, []);

  return {
    connected,
    players,
    error,
    sendMove,
    sendCardPlacement,
    requestSync
  };
}
```

## 3. Synchronisation d'État

```typescript
// lib/sync/GameSyncManager.ts
export class GameSyncManager {
  private lastSync: number = 0;
  private syncInterval: number = 5000; // 5 secondes
  private pendingUpdates: Map<string, any> = new Map();
  private syncTimer: NodeJS.Timer | null = null;

  constructor(
    private gameId: string,
    private channel: GameChannelManager,
    private onSync: (state: any) => void
  ) {}

  // Démarrer la synchronisation périodique
  startPeriodicSync() {
    this.syncTimer = setInterval(async () => {
      if (this.hasPendingUpdates()) {
        await this.syncState();
      }
    }, this.syncInterval);
  }

  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Ajouter une mise à jour en attente
  addPendingUpdate(key: string, update: any) {
    this.pendingUpdates.set(key, {
      ...update,
      timestamp: Date.now()
    });
  }

  // Synchroniser l'état
  async syncState() {
    if (!this.hasPendingUpdates()) return;

    const updates = Array.from(this.pendingUpdates.values());
    this.pendingUpdates.clear();

    try {
      // Récupérer l'état actuel depuis la DB
      const currentState = await this.fetchCurrentState();
      
      // Appliquer les mises à jour
      const newState = this.applyUpdates(currentState, updates);
      
      // Sauvegarder en DB
      await this.saveState(newState);
      
      // Notifier via le channel
      await this.channel.sendStateTransition({
        type: 'STATE_SYNC',
        state: newState,
        updates
      });

      this.lastSync = Date.now();
      this.onSync(newState);

    } catch (error) {
      console.error('Sync failed:', error);
      // Remettre les updates en attente
      updates.forEach((update, index) => {
        this.pendingUpdates.set(`retry_${index}`, update);
      });
    }
  }

  private hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  private async fetchCurrentState() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', this.gameId)
      .single();

    if (error) throw error;
    return data;
  }

  private applyUpdates(state: any, updates: any[]) {
    let newState = { ...state };

    for (const update of updates) {
      switch (update.type) {
        case 'SCORE_UPDATE':
          newState.score_a = update.scoreA ?? newState.score_a;
          newState.score_b = update.scoreB ?? newState.score_b;
          break;
        
        case 'BALL_POSITION':
          newState.ball_position = update.position;
          break;
        
        case 'TURN_UPDATE':
          newState.current_turn = update.turn;
          newState.current_player = update.currentPlayer;
          break;
        
        case 'STATE_TRANSITION':
          newState.status = update.newState;
          break;
        
        default:
          newState.game_state = {
            ...newState.game_state,
            ...update
          };
      }
    }

    return newState;
  }

  private async saveState(state: any) {
    const { error } = await supabase
      .from('games')
      .update({
        ...state,
        updated_at: new Date()
      })
      .eq('id', this.gameId);

    if (error) throw error;
  }

  // Forcer une synchronisation immédiate
  async forceSync() {
    await this.syncState();
  }

  // Résoudre les conflits
  resolveConflict(localState: any, remoteState: any): any {
    // Stratégie: le serveur a toujours raison
    return remoteState;
  }
}
```

## 4. Gestion de la Reconnexion

```typescript
// lib/sync/ReconnectionHandler.ts
export class ReconnectionHandler {
  private reconnectAttempts = 0;
  private maxAttempts = 5;
  private baseDelay = 1000;
  private maxDelay = 30000;
  
  constructor(
    private gameId: string,
    private userId: string,
    private onReconnect: () => void,
    private onFailure: (error: Error) => void
  ) {}

  async handleReconnection() {
    while (this.reconnectAttempts < this.maxAttempts) {
      const delay = this.calculateDelay();
      console.log(`Tentative de reconnexion ${this.reconnectAttempts + 1}/${this.maxAttempts} dans ${delay}ms`);
      
      await this.wait(delay);
      
      try {
        await this.attemptReconnection();
        this.reconnectAttempts = 0; // Reset on success
        this.onReconnect();
        return;
      } catch (error) {
        this.reconnectAttempts++;
        console.error(`Échec de reconnexion:`, error);
      }
    }
    
    this.onFailure(new Error('Max reconnection attempts reached'));
  }

  private async attemptReconnection() {
    // 1. Vérifier l'état du jeu
    const gameState = await this.checkGameState();
    
    if (!gameState) {
      throw new Error('Game not found');
    }
    
    if (gameState.status === 'completed') {
      throw new Error('Game already completed');
    }

    // 2. Vérifier si c'est toujours notre tour
    const isOurTurn = gameState.current_player === this.userId;
    
    // 3. Calculer le temps restant
    const timeRemaining = this.calculateTimeRemaining(gameState.turn_started_at);
    
    if (isOurTurn && timeRemaining <= 0) {
      throw new Error('Turn timeout exceeded');
    }

    // 4. Se reconnecter au channel
    // (Géré par GameChannelManager)
    
    return {
      gameState,
      isOurTurn,
      timeRemaining
    };
  }

  private async checkGameState() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', this.gameId)
      .single();
    
    if (error) throw error;
    return data;
  }

  private calculateDelay(): number {
    const exponentialDelay = this.baseDelay * Math.pow(2, this.reconnectAttempts);
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5);
    return Math.min(jitteredDelay, this.maxDelay);
  }

  private calculateTimeRemaining(turnStartedAt: string): number {
    if (!turnStartedAt) return 45;
    
    const elapsed = Date.now() - new Date(turnStartedAt).getTime();
    const remaining = 45000 - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 5. Types et Interfaces

```typescript
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
```

## 6. Intégration avec le GameContext

```typescript
// contexts/GameContext.tsx
import { useGameChannel } from '@/hooks/useGameChannel';
import { GameSyncManager } from '@/lib/sync/GameSyncManager';

export const GameProvider: React.FC = ({ children, gameId }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { connected, sendMove, sendCardPlacement } = useGameChannel(gameId);
  const syncManagerRef = useRef<GameSyncManager | null>(null);

  // Initialiser le gestionnaire de synchronisation
  useEffect(() => {
    if (connected && gameId) {
      syncManagerRef.current = new GameSyncManager(
        gameId,
        channelManager,
        (syncedState) => {
          dispatch({
            type: 'SYNC_COMPLETE',
            payload: syncedState
          });
        }
      );

      syncManagerRef.current.startPeriodicSync();

      return () => {
        syncManagerRef.current?.stopPeriodicSync();
      };
    }
  }, [connected, gameId]);

  // Actions exposées
  const actions = {
    makeMove: async (move: any) => {
      // Optimistic update
      dispatch({ type: 'MOVE_START', payload: move });
      
      try {
        // Envoyer via channel
        await sendMove(move);
        
        // Envoyer à l'API
        const result = await api.makeMove(gameId, move);
        
        dispatch({ type: 'MOVE_SUCCESS', payload: result });
      } catch (error) {
        dispatch({ type: 'MOVE_ERROR', payload: error });
      }
    },
    
    placeCard: async (placement: any) => {
      dispatch({ type: 'PLACEMENT_START', payload: placement });
      
      try {
        await sendCardPlacement(placement);
        const result = await api.placeCard(gameId, placement);
        dispatch({ type: 'PLACEMENT_SUCCESS', payload: result });
      } catch (error) {
        dispatch({ type: 'PLACEMENT_ERROR', payload: error });
      }
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, actions, connected }}>
      {children}
    </GameContext.Provider>
  );
};
```