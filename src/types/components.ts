import { BoardState, BoardPosition } from './base';
import { PlayerCard, UserPlayer, BonusCard, Profile } from './models';

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
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
}