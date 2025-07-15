// lib/channels/GameChannelManager.ts
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

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