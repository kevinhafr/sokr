// services/game.ts
import { supabase } from '@/services/supabase';
import { Game, Move, Placement, GameState } from '@/types';

export class GameService {
  static async loadGameHistory(gameId: string) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        player_a_profile:profiles!games_player_a_fkey(*),
        player_b_profile:profiles!games_player_b_fkey(*)
      `)
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return data;
  }

  static async getGameMoves(gameId: string) {
    const { data, error } = await supabase
      .from('moves')
      .select(`
        *,
        actor_card:players!moves_actor_card_id_fkey(*),
        target_card:players!moves_target_card_id_fkey(*)
      `)
      .eq('game_id', gameId)
      .order('turn_number, created_at');

    if (error) throw error;
    return data;
  }

  static async getPlacements(gameId: string) {
    const { data, error } = await supabase
      .from('placements')
      .select(`
        *,
        card:players(*)
      `)
      .eq('game_id', gameId)
      .order('placement_order');

    if (error) throw error;
    return data;
  }

  static async getReplayData(gameId: string) {
    const [game, moves, placements] = await Promise.all([
      this.getGame(gameId),
      this.getGameMoves(gameId),
      this.getPlacements(gameId),
    ]);

    return {
      game,
      moves,
      placements,
    };
  }

  static async simulateGame(gameState: GameState, moves: Move[]) {
    // Simulation locale du jeu pour les replays
    const simulation = new GameSimulation(gameState);
    
    for (const move of moves) {
      simulation.applyMove(move);
    }
    
    return simulation.getState();
  }

  private static async getGame(gameId: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return data;
  }
}

// Classe pour simuler localement une partie
class GameSimulation {
  private state: GameState;

  constructor(initialState: GameState) {
    this.state = { ...initialState };
  }

  applyMove(move: Move) {
    // Logique de simulation du mouvement
    switch (move.action_type) {
      case 'pass':
        this.handlePass(move);
        break;
      case 'shot':
        this.handleShot(move);
        break;
      case 'dribble':
        this.handleDribble(move);
        break;
    }
    
    this.state.turn++;
  }

  private handlePass(move: Move) {
    if (move.success) {
      this.state.ballPosition = move.to_position!;
    }
  }

  private handleShot(move: Move) {
    if (move.success && move.critical) {
      // But marqué
      const isTeamA = this.isTeamAPlayer(move.player_id);
      if (isTeamA) {
        this.state.scoreA++;
      } else {
        this.state.scoreB++;
      }
      
      // Réinitialiser la position du ballon
      this.state.ballPosition = 'Z2-2';
    }
  }

  private handleDribble(move: Move) {
    if (move.success) {
      this.state.ballPosition = move.to_position!;
    }
  }

  private isTeamAPlayer(playerId: string): boolean {
    // Logique pour déterminer l'équipe
    return true; // Simplification
  }

  getState(): GameState {
    return { ...this.state };
  }
}