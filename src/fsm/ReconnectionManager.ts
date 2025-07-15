export class ReconnectionManager {
  static async handleReconnection(
    userId: string,
    gameId: string
  ): Promise<GameReconnectionData> {
    // Récupérer l'état du jeu depuis la DB
    const game = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (!game.data) {
      throw new Error('Game not found');
    }

    // Vérifier si le joueur fait partie de la partie
    if (game.data.player_a !== userId && game.data.player_b !== userId) {
      throw new Error('Unauthorized');
    }

    // Récupérer l'historique des moves
    const moves = await supabase
      .from('moves')
      .select('*')
      .eq('game_id', gameId)
      .order('turn_number', { ascending: true });

    // Reconstruire l'état
    const reconstructedState = this.reconstructGameState(
      game.data,
      moves.data
    );

    return {
      gameState: reconstructedState,
      currentPlayer: game.data.current_player,
      canPlay: game.data.current_player === userId,
      timeRemaining: this.calculateTimeRemaining(game.data.turn_started_at)
    };
  }

  private static reconstructGameState(game: any, moves: any[]): any {
    // Logique de reconstruction de l'état
    return {
      status: game.status,
      boardState: game.board_state,
      ballPosition: game.ball_position,
      scores: {
        a: game.score_a,
        b: game.score_b
      },
      turn: game.current_turn,
      moves: moves
    };
  }

  private static calculateTimeRemaining(turnStartedAt: string): number {
    if (!turnStartedAt) return 45;
    
    const elapsed = Date.now() - new Date(turnStartedAt).getTime();
    const remaining = 45000 - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }
}