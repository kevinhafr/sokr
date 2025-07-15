// lib/sync/GameSyncManager.ts
import { supabase } from '@/services/supabase';
import { GameChannelManager } from '@/lib/channels/GameChannelManager';

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