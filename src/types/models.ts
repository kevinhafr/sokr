import { 
  UserRole, 
  GameStatus, 
  CardRarity, 
  PlayerPosition, 
  BoardPosition, 
  ActionType, 
  GameResult, 
  GameMode, 
  BonusCardType 
} from './base';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  mmr: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  ban_until?: string;
  consecutive_abandons: number;
  last_abandon_at?: string;
  settings: {
    sound: boolean;
    vibration: boolean;
  };
}

export interface PlayerCard {
  id: string;
  name: string;
  nationality: string;
  position: PlayerPosition;
  rarity: CardRarity;
  shot: number;
  dribble: number;
  pass: number;
  block: number;
  cp_cost: number;
  special_ability?: string;
  reroll_count: number;
  image_url?: string;
  edition: string;
  total_editions?: number;
  available_editions?: number;
}

export interface UserPlayer {
  id: string;
  user_id: string;
  player_id: string;
  level: number;
  xp: number;
  total_xp: number;
  stat_upgrades: Record<string, number>;
  obtained_at: string;
  games_played: number;
  goals_scored: number;
  assists_made: number;
  duels_won: number;
}

export interface BonusCard {
  id: string;
  name: string;
  emoji: string;
  type: BonusCardType;
  effect: string;
  duration: number;
  timing: 'immediate' | 'turn_start' | 'reaction';
  set_name: string;
  card_number: number;
}

export interface Game {
  id: string;
  created_at: string;
  updated_at: string;
  status: GameStatus;
  current_turn: number;
  turn_started_at?: string;
  player_a: string;
  player_b?: string;
  current_player?: string;
  score_a: number;
  score_b: number;
  winner?: string;
  result_a?: GameResult;
  result_b?: GameResult;
  coin_toss_winner?: string;
  first_placement_player?: string;
  halftime_first_player?: string;
  game_state: GameState;
  board_state: BoardState;
  ball_position: BoardPosition;
  mode: GameMode;
  mmr_change?: {
    player_a: number;
    player_b: number;
  };
  completed_at?: string;
  deck_a?: string;
  deck_b?: string;
}

export interface GameState {
  boardState: BoardState;
  ballPosition: BoardPosition;
  turn: number;
  placementCount: Record<string, number>;
  bonusCardUsed?: string;
  coinTossResult?: {
    winner: string;
    timestamp: string;
  };
  halfTimeReplacements?: Record<string, Placement[]>;
}

export interface BoardState {
  [position: string]: {
    player: string;
    cardId: string;
    isExpelled?: boolean;
    expelledUntil?: number;
  };
}

export interface Placement {
  id: string;
  game_id: string;
  player_id: string;
  card_id: string;
  position: BoardPosition;
  placement_order: number;
  placed_at: string;
  is_substitute: boolean;
  is_expelled: boolean;
  expelled_until_turn?: number;
}

export interface Move {
  id: string;
  game_id: string;
  turn_number: number;
  player_id: string;
  action_type: ActionType;
  actor_card_id: string;
  target_card_id?: string;
  from_position: BoardPosition;
  to_position?: BoardPosition;
  initial_roll: number;
  attacker_roll?: number;
  defender_roll?: number;
  attacker_total?: number;
  defender_total?: number;
  modifiers: MoveModifiers;
  bonus_card_used?: string;
  reroll_used: boolean;
  special_ability_used: boolean;
  success: boolean;
  critical: boolean;
  result_description: string;
  xp_gained: Record<string, number>;
  created_at: string;
  duration_ms: number;
  hash: string;
  server_validated: boolean;
}

export interface MoveModifiers {
  rarity?: number;
  bonus_card?: number;
  stat?: number;
}

export interface SavedDeck {
  id: string;
  user_id: string;
  name: string;
  cards: string[];
  bonus_card?: string;
  total_cp: number;
  is_valid: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackType {
  id: string;
  name: string;
  description: string;
  price: number;
  card_count: number;
  probabilities: Record<CardRarity, number>;
  guarantees: Record<CardRarity, number>;
  is_active: boolean;
  display_order: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  pack_type_id: string;
  amount: number;
  currency: string;
  transaction_id: string;
  cards_received: string[];
  opened_at?: string;
  created_at: string;
  platform: 'ios' | 'android' | 'web';
  bonus_applied: any;
}