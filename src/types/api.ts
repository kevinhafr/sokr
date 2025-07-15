import { GameMode, ActionType, BoardPosition } from './base';

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