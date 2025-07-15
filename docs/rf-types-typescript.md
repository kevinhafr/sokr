# Rocket Footy - Types TypeScript

## Types de base

```typescript
// types/base.ts

// Énumérations
export type UserRole = 'user' | 'admin';

export type GameStatus = 
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

export type CardRarity = 'Common' | 'Limited' | 'Rare' | 'SuperRare' | 'Unique';

export type PlayerPosition = 'gardien' | 'defenseur' | 'milieu' | 'attaquant';

export type BoardPosition = 
  | 'G1' 
  | 'Z1-1' | 'Z1-2' | 'Z1-3'
  | 'Z2-1' | 'Z2-2' | 'Z2-3'
  | 'Z3-1' | 'Z3-2' | 'Z3-3'
  | 'G2';

export type ActionType = 'pass' | 'shot' | 'dribble' | 'substitute' | 'play_bonus';

export type GameResult = 'win' | 'loss' | 'draw' | 'abandon';

export type GameMode = 'quick' | 'draft' | 'friendly';

export type BonusCardType = 'Play' | 'Condition';
```

## Types de données

```typescript
// types/models.ts

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
  formation?: number;
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
```

## Types de requêtes API

```typescript
// types/api.ts

export interface CreateGameRequest {
  mode: GameMode;
  deckId?: string;
  inviteCode?: string;
}

export interface JoinGameRequest {
  gameId?: string;
  inviteCode?: string;
}

export interface MakeMoveRequest {
  gameId: string;
  action: ActionType;
  actorPosition: BoardPosition;
  targetPosition?: BoardPosition;
  bonusCardId?: string;
}

export interface PlaceCardRequest {
  gameId: string;
  cardId: string;
  position: BoardPosition;
  isSubstitute?: boolean;
}

export interface ValidateDeckRequest {
  cards: string[];
  name?: string;
  save?: boolean;
}

export interface OpenPackRequest {
  packTypeId: string;
  purchaseId: string;
}

export interface MatchmakeRequest {
  mode: GameMode;
  deckId?: string;
}
```

## Types de réponses API

```typescript
// types/responses.ts

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface CreateGameResponse {
  game: Game;
  inviteCode?: string;
}

export interface JoinGameResponse {
  game: Game;
  action: 'joined' | 'created';
  timeout?: number;
}

export interface MakeMoveResponse {
  move: Move;
  gameState: GameState;
  xpGained: Record<string, number>;
}

export interface PlaceCardResponse {
  placement: Placement;
  nextPlayer: string;
}

export interface ValidateDeckResponse {
  valid: boolean;
  deck?: SavedDeck;
  totalCP?: number;
  composition?: {
    positions: Record<PlayerPosition, number>;
    rarities: Record<CardRarity, number>;
  };
  error?: string;
  details?: any;
}

export interface OpenPackResponse {
  cards: PlayerCard[];
  bonusApplied: boolean;
}

export interface MatchmakeResponse {
  game: Game;
  action: 'joined' | 'created';
  timeout?: number;
}
```

## Types pour le state management

```typescript
// types/state.ts

export interface AppState {
  auth: AuthState;
  game: GameStateType;
  deck: DeckState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

export interface GameStateType {
  currentGame: Game | null;
  gameStatus: GameStatus;
  board: BoardState;
  ballPosition: BoardPosition;
  currentTurn: number;
  currentPlayer: string | null;
  scores: {
    teamA: number;
    teamB: number;
  };
  moves: Move[];
  placements: Placement[];
  isLoading: boolean;
  error: Error | null;
  realtime: {
    connected: boolean;
    players: string[];
    lastSync: number;
  };
}

export interface DeckState {
  userCards: UserPlayer[];
  currentDeck: string[];
  savedDecks: SavedDeck[];
  bonusCard: string | null;
  isValidDeck: boolean;
  totalCP: number;
  composition: {
    positions: Record<PlayerPosition, number>;
    rarities: Record<CardRarity, number>;
  };
}

export interface UIState {
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```

## Types pour les événements

```typescript
// types/events.ts

export type GameEvent =
  | { type: 'PLAYER_JOINED'; payload: { playerId: string } }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string } }
  | { type: 'COIN_TOSS_COMPLETE'; payload: { winner: string } }
  | { type: 'CARD_PLACED'; payload: { player: string; position: string } }
  | { type: 'PLACEMENT_CONFIRMED'; payload: { player: string } }
  | { type: 'ACTION_COMPLETE'; payload: { player: string; action: any } }
  | { type: 'HALF_TIME_REACHED'; payload: {} }
  | { type: 'GAME_ENDED'; payload: { winner: string } }
  | { type: 'TIMEOUT'; payload: { currentState: GameStatus } }
  | { type: 'ABANDON'; payload: { player: string } };

export type RealtimeEvent =
  | { type: 'STATE_UPDATE'; payload: any }
  | { type: 'GAME_EVENT'; payload: GameEvent }
  | { type: 'PLAYER_STATUS'; payload: PlayerStatusEvent }
  | { type: 'SYSTEM_ALERT'; payload: SystemAlert };

export interface PlayerStatusEvent {
  type: 'PLAYER_JOINED' | 'PLAYER_LEFT' | 'PRESENCE_SYNC' | 'DISCONNECTED';
  playerId?: string;
  players?: string[];
  timestamp: number;
}

export interface SystemAlert {
  type: 'TIMEOUT_WARNING' | 'DISCONNECT_WARNING' | 'GAME_ENDING';
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: number;
}
```

## Types utilitaires

```typescript
// types/utils.ts

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export type ValueOf<T> = T[keyof T];

export type Entries<T> = [keyof T, ValueOf<T>][];

// Helper pour les actions Redux
export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : { type: Key; payload: M[Key] };
};

// Type guard helpers
export const isPlayerCard = (card: any): card is PlayerCard => {
  return card && typeof card.id === 'string' && typeof card.rarity === 'string';
};

export const isGameActive = (game: Game): boolean => {
  return ['active', 'activeTurnA', 'activeTurnB'].includes(game.status);
};

export const isPlayerTurn = (game: Game, playerId: string): boolean => {
  return game.current_player === playerId;
};
```

## Types pour les hooks

```typescript
// types/hooks.ts

export interface UseGameReturn {
  game: Game | null;
  isLoading: boolean;
  error: Error | null;
  makeMove: (move: MakeMoveRequest) => Promise<void>;
  placeCard: (placement: PlaceCardRequest) => Promise<void>;
  forfeit: () => Promise<void>;
}

export interface UseDeckReturn {
  deck: string[];
  bonusCard: string | null;
  isValid: boolean;
  totalCP: number;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  saveDeck: (name: string) => Promise<void>;
  loadDeck: (deckId: string) => Promise<void>;
}

export interface UseRealtimeReturn {
  connected: boolean;
  players: string[];
  error: Error | null;
  sendAction: (action: any) => Promise<void>;
  requestSync: () => Promise<void>;
}

export interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}
```

## Types pour les composants

```typescript
// types/components.ts

export interface GameBoardProps {
  board: BoardState;
  ballPosition: BoardPosition;
  onCellClick?: (position: BoardPosition) => void;
  highlightedCells?: BoardPosition[];
  isInteractive?: boolean;
}

export interface PlayerCardProps {
  card: PlayerCard;
  userCard?: UserPlayer;
  onClick?: () => void;
  isSelected?: boolean;
  showXP?: boolean;
  showLevel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface BonusCardProps {
  card: BonusCard;
  onClick?: () => void;
  isPlayable?: boolean;
  isUsed?: boolean;
}

export interface TimerProps {
  duration: number;
  onTimeout: () => void;
  isPaused?: boolean;
  showWarning?: boolean;
  warningThreshold?: number;
}

export interface ScoreboardProps {
  scoreA: number;
  scoreB: number;
  playerA: Profile;
  playerB: Profile;
  currentTurn: number;
  currentPlayer: string;
}

export interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onDismiss?: () => void;
}
```