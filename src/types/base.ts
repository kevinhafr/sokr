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