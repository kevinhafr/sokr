// Types des états
export type GameState = 
  | 'initializing'
  | 'waitingForPlayers'
  | 'coinToss'
  | 'placement'
  | 'placementTeamA'
  | 'placementTeamB'
  | 'placementLocked'
  | 'active'
  | 'activeTurnA'
  | 'activeTurnB'
  | 'halfTime'
  | 'completed';

// Events de transition
export type GameEvent =
  | { type: 'PLAYER_JOINED'; player: string }
  | { type: 'PLAYER_LEFT'; player: string }
  | { type: 'COIN_TOSS_COMPLETE'; winner: string }
  | { type: 'CARD_PLACED'; player: string; position: string }
  | { type: 'PLACEMENT_CONFIRMED'; player: string }
  | { type: 'ACTION_COMPLETE'; player: string }
  | { type: 'HALF_TIME_REACHED' }
  | { type: 'GAME_ENDED' }
  | { type: 'TIMEOUT'; currentState: GameState }
  | { type: 'ABANDON'; player: string };

// Contexte de la FSM
export interface GameContext {
  gameId: string;
  playerA: string;
  playerB: string;
  currentPlayer: string;
  currentTurn: number;
  coinTossWinner: string | null;
  scoreA: number;
  scoreB: number;
  boardState: BoardState;
  ballPosition: BoardPosition;
  timeouts: {
    turn: NodeJS.Timeout | null;
    global: NodeJS.Timeout | null;
  };
  placementCount: {
    [playerId: string]: number;
  };
}