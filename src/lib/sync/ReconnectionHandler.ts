// lib/sync/ReconnectionHandler.ts
import { supabase } from '@/services/supabase';

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