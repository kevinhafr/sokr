# Rocket Footy - Reducers & Actions

## 1. Actions Types

```typescript
// store/actions/types.ts

// Auth Actions
export const AUTH_ACTION_TYPES = {
  LOGIN_REQUEST: 'AUTH/LOGIN_REQUEST',
  LOGIN_SUCCESS: 'AUTH/LOGIN_SUCCESS',
  LOGIN_FAILURE: 'AUTH/LOGIN_FAILURE',
  LOGOUT: 'AUTH/LOGOUT',
  REGISTER_REQUEST: 'AUTH/REGISTER_REQUEST',
  REGISTER_SUCCESS: 'AUTH/REGISTER_SUCCESS',
  REGISTER_FAILURE: 'AUTH/REGISTER_FAILURE',
  UPDATE_PROFILE: 'AUTH/UPDATE_PROFILE',
  REFRESH_TOKEN: 'AUTH/REFRESH_TOKEN',
  SET_LOADING: 'AUTH/SET_LOADING',
  CLEAR_ERROR: 'AUTH/CLEAR_ERROR',
} as const;

// Game Actions
export const GAME_ACTION_TYPES = {
  LOAD_GAME: 'GAME/LOAD_GAME',
  SET_GAME: 'GAME/SET_GAME',
  UPDATE_GAME_STATE: 'GAME/UPDATE_GAME_STATE',
  MAKE_MOVE: 'GAME/MAKE_MOVE',
  PLACE_CARD: 'GAME/PLACE_CARD',
  ADD_MOVE: 'GAME/ADD_MOVE',
  SET_MOVES: 'GAME/SET_MOVES',
  SET_TURN_TIME: 'GAME/SET_TURN_TIME',
  PLAY_BONUS_CARD: 'GAME/PLAY_BONUS_CARD',
  FORFEIT_GAME: 'GAME/FORFEIT_GAME',
  SET_CONNECTION_STATUS: 'GAME/SET_CONNECTION_STATUS',
  SYNC_STATE: 'GAME/SYNC_STATE',
  GAME_ERROR: 'GAME/ERROR',
  RESET_GAME: 'GAME/RESET',
} as const;

// Deck Actions
export const DECK_ACTION_TYPES = {
  SET_USER_CARDS: 'DECK/SET_USER_CARDS',
  SET_CURRENT_DECK: 'DECK/SET_CURRENT_DECK',
  ADD_CARD_TO_DECK: 'DECK/ADD_CARD',
  REMOVE_CARD_FROM_DECK: 'DECK/REMOVE_CARD',
  SELECT_BONUS_CARD: 'DECK/SELECT_BONUS_CARD',
  SAVE_DECK: 'DECK/SAVE_DECK',
  LOAD_DECK: 'DECK/LOAD_DECK',
  DELETE_DECK: 'DECK/DELETE_DECK',
  SET_DECK_VALID: 'DECK/SET_VALID',
  UPDATE_COMPOSITION: 'DECK/UPDATE_COMPOSITION',
  SET_LOADING: 'DECK/SET_LOADING',
  SET_ERROR: 'DECK/SET_ERROR',
} as const;

// Shop Actions
export const SHOP_ACTION_TYPES = {
  LOAD_PACKS: 'SHOP/LOAD_PACKS',
  PURCHASE_PACK: 'SHOP/PURCHASE_PACK',
  OPEN_PACK: 'SHOP/OPEN_PACK',
  SET_PACK_TYPES: 'SHOP/SET_PACK_TYPES',
  SET_PURCHASES: 'SHOP/SET_PURCHASES',
  ADD_PURCHASE: 'SHOP/ADD_PURCHASE',
  UPDATE_PURCHASE: 'SHOP/UPDATE_PURCHASE',
  SET_LOADING: 'SHOP/SET_LOADING',
  SET_ERROR: 'SHOP/SET_ERROR',
} as const;

// Matchmaking Actions
export const MATCHMAKING_ACTION_TYPES = {
  START_SEARCH: 'MATCHMAKING/START_SEARCH',
  MATCH_FOUND: 'MATCHMAKING/MATCH_FOUND',
  CANCEL_SEARCH: 'MATCHMAKING/CANCEL_SEARCH',
  UPDATE_SEARCH_TIME: 'MATCHMAKING/UPDATE_SEARCH_TIME',
  SET_ERROR: 'MATCHMAKING/SET_ERROR',
} as const;
```

## 2. Action Creators

```typescript
// store/actions/auth.ts
import { ThunkAction } from 'redux-thunk';
import { AUTH_ACTION_TYPES } from './types';
import { AuthService } from '@/services/auth';
import { RootState } from '../store';

export interface AuthAction {
  type: keyof typeof AUTH_ACTION_TYPES;
  payload?: any;
}

// Action Creators
export const authActions = {
  loginRequest: (): AuthAction => ({
    type: 'LOGIN_REQUEST',
  }),

  loginSuccess: (user: any, profile: any): AuthAction => ({
    type: 'LOGIN_SUCCESS',
    payload: { user, profile },
  }),

  loginFailure: (error: Error): AuthAction => ({
    type: 'LOGIN_FAILURE',
    payload: error,
  }),

  logout: (): AuthAction => ({
    type: 'LOGOUT',
  }),

  updateProfile: (updates: any): AuthAction => ({
    type: 'UPDATE_PROFILE',
    payload: updates,
  }),

  setLoading: (loading: boolean): AuthAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  clearError: (): AuthAction => ({
    type: 'CLEAR_ERROR',
  }),
};

// Thunk Actions
export const login = (
  email: string,
  password: string
): ThunkAction<Promise<void>, RootState, unknown, AuthAction> => {
  return async (dispatch) => {
    try {
      dispatch(authActions.loginRequest());
      
      const { user, profile } = await AuthService.signIn(email, password);
      
      dispatch(authActions.loginSuccess(user, profile));
    } catch (error) {
      dispatch(authActions.loginFailure(error as Error));
      throw error;
    }
  };
};

export const logout = (): ThunkAction<Promise<void>, RootState, unknown, AuthAction> => {
  return async (dispatch) => {
    try {
      await AuthService.signOut();
      dispatch(authActions.logout());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
};

export const register = (
  email: string,
  password: string,
  username: string
): ThunkAction<Promise<void>, RootState, unknown, AuthAction> => {
  return async (dispatch) => {
    try {
      dispatch(authActions.loginRequest());
      
      const { user, profile } = await AuthService.signUp(email, password, username);
      
      dispatch(authActions.loginSuccess(user, profile));
    } catch (error) {
      dispatch(authActions.loginFailure(error as Error));
      throw error;
    }
  };
};
```

```typescript
// store/actions/game.ts
import { ThunkAction } from 'redux-thunk';
import { GAME_ACTION_TYPES } from './types';
import { ApiService } from '@/services/api';
import { RootState } from '../store';

export interface GameAction {
  type: keyof typeof GAME_ACTION_TYPES;
  payload?: any;
}

export const gameActions = {
  loadGame: (gameId: string): GameAction => ({
    type: 'LOAD_GAME',
    payload: gameId,
  }),

  setGame: (game: any): GameAction => ({
    type: 'SET_GAME',
    payload: game,
  }),

  updateGameState: (updates: any): GameAction => ({
    type: 'UPDATE_GAME_STATE',
    payload: updates,
  }),

  addMove: (move: any): GameAction => ({
    type: 'ADD_MOVE',
    payload: move,
  }),

  setMoves: (moves: any[]): GameAction => ({
    type: 'SET_MOVES',
    payload: moves,
  }),

  setTurnTime: (time: number): GameAction => ({
    type: 'SET_TURN_TIME',
    payload: time,
  }),

  setConnectionStatus: (status: string): GameAction => ({
    type: 'SET_CONNECTION_STATUS',
    payload: status,
  }),

  syncState: (state: any): GameAction => ({
    type: 'SYNC_STATE',
    payload: state,
  }),

  gameError: (error: Error): GameAction => ({
    type: 'GAME_ERROR',
    payload: error,
  }),

  resetGame: (): GameAction => ({
    type: 'RESET_GAME',
  }),
};

// Thunk Actions
export const loadGame = (
  gameId: string
): ThunkAction<Promise<void>, RootState, unknown, GameAction> => {
  return async (dispatch) => {
    try {
      dispatch(gameActions.loadGame(gameId));
      
      const game = await ApiService.getGame(gameId);
      const moves = await ApiService.getGameMoves(gameId);
      
      dispatch(gameActions.setGame(game));
      dispatch(gameActions.setMoves(moves));
    } catch (error) {
      dispatch(gameActions.gameError(error as Error));
    }
  };
};

export const makeMove = (
  move: any
): ThunkAction<Promise<void>, RootState, unknown, GameAction> => {
  return async (dispatch, getState) => {
    try {
      const { game } = getState();
      
      if (!game.currentGame) {
        throw new Error('No game in progress');
      }
      
      const result = await ApiService.makeMove({
        gameId: game.currentGame.id,
        ...move,
      });
      
      dispatch(gameActions.addMove(result.move));
      dispatch(gameActions.updateGameState(result.gameState));
    } catch (error) {
      dispatch(gameActions.gameError(error as Error));
      throw error;
    }
  };
};

export const placeCard = (
  cardId: string,
  position: string
): ThunkAction<Promise<void>, RootState, unknown, GameAction> => {
  return async (dispatch, getState) => {
    try {
      const { game } = getState();
      
      if (!game.currentGame) {
        throw new Error('No game in progress');
      }
      
      const result = await ApiService.placeCard({
        gameId: game.currentGame.id,
        cardId,
        position,
      });
      
      dispatch(gameActions.updateGameState(result));
    } catch (error) {
      dispatch(gameActions.gameError(error as Error));
      throw error;
    }
  };
};
```

```typescript
// store/actions/deck.ts
import { ThunkAction } from 'redux-thunk';
import { DECK_ACTION_TYPES } from './types';
import { CardService } from '@/services/cards';
import { RootState } from '../store';

export interface DeckAction {
  type: keyof typeof DECK_ACTION_TYPES;
  payload?: any;
}

export const deckActions = {
  setUserCards: (cards: any[]): DeckAction => ({
    type: 'SET_USER_CARDS',
    payload: cards,
  }),

  setCurrentDeck: (cards: string[]): DeckAction => ({
    type: 'SET_CURRENT_DECK',
    payload: cards,
  }),

  addCardToDeck: (cardId: string): DeckAction => ({
    type: 'ADD_CARD_TO_DECK',
    payload: cardId,
  }),

  removeCardFromDeck: (cardId: string): DeckAction => ({
    type: 'REMOVE_CARD_FROM_DECK',
    payload: cardId,
  }),

  selectBonusCard: (cardId: string): DeckAction => ({
    type: 'SELECT_BONUS_CARD',
    payload: cardId,
  }),

  setDeckValid: (valid: boolean): DeckAction => ({
    type: 'SET_DECK_VALID',
    payload: valid,
  }),

  updateComposition: (composition: any): DeckAction => ({
    type: 'UPDATE_COMPOSITION',
    payload: composition,
  }),

  setLoading: (loading: boolean): DeckAction => ({
    type: 'SET_LOADING',
    payload: loading,
  }),

  setError: (error: Error | null): DeckAction => ({
    type: 'SET_ERROR',
    payload: error,
  }),
};

// Thunk Actions
export const loadUserCards = (): ThunkAction<Promise<void>, RootState, unknown, DeckAction> => {
  return async (dispatch, getState) => {
    try {
      dispatch(deckActions.setLoading(true));
      
      const { auth } = getState();
      if (!auth.user) return;
      
      const cards = await CardService.getUserCards(auth.user.id);
      dispatch(deckActions.setUserCards(cards));
    } catch (error) {
      dispatch(deckActions.setError(error as Error));
    } finally {
      dispatch(deckActions.setLoading(false));
    }
  };
};

export const saveDeck = (
  name: string
): ThunkAction<Promise<void>, RootState, unknown, DeckAction> => {
  return async (dispatch, getState) => {
    try {
      dispatch(deckActions.setLoading(true));
      
      const { deck } = getState();
      
      if (!deck.isValid) {
        throw new Error('Invalid deck');
      }
      
      const result = await ApiService.saveDeck(
        name,
        deck.currentDeck,
        deck.bonusCard
      );
      
      // Ajouter aux decks sauvegardés
      dispatch({
        type: 'ADD_SAVED_DECK',
        payload: result,
      });
    } catch (error) {
      dispatch(deckActions.setError(error as Error));
      throw error;
    } finally {
      dispatch(deckActions.setLoading(false));
    }
  };
};
```

## 3. Reducers

```typescript
// store/reducers/auth.ts
import { AuthAction } from '../actions/auth';
import { AUTH_ACTION_TYPES } from '../actions/types';

export interface AuthState {
  user: any | null;
  profile: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export function authReducer(
  state = initialState,
  action: AuthAction
): AuthState {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'REGISTER_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'LOGOUT':
      return initialState;

    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}
```

```typescript
// store/reducers/game.ts
import { GameAction } from '../actions/game';
import { GAME_ACTION_TYPES } from '../actions/types';

export interface GameState {
  currentGame: any | null;
  gameState: any | null;
  moves: any[];
  placements: any[];
  isLoading: boolean;
  error: Error | null;
  isMyTurn: boolean;
  timeRemaining: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

const initialState: GameState = {
  currentGame: null,
  gameState: null,
  moves: [],
  placements: [],
  isLoading: false,
  error: null,
  isMyTurn: false,
  timeRemaining: 45,
  connectionStatus: 'disconnected',
};

export function gameReducer(
  state = initialState,
  action: GameAction
): GameState {
  switch (action.type) {
    case 'LOAD_GAME':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        gameState: action.payload.game_state,
        isLoading: false,
      };

    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          ...action.payload,
        },
      };

    case 'ADD_MOVE':
      return {
        ...state,
        moves: [...state.moves, action.payload],
      };

    case 'SET_MOVES':
      return {
        ...state,
        moves: action.payload,
      };

    case 'SET_TURN_TIME':
      return {
        ...state,
        timeRemaining: action.payload,
      };

    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
      };

    case 'SYNC_STATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'GAME_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'RESET_GAME':
      return initialState;

    default:
      return state;
  }
}
```

```typescript
// store/reducers/deck.ts
import { DeckAction } from '../actions/deck';
import { DECK_ACTION_TYPES } from '../actions/types';

export interface DeckState {
  userCards: any[];
  currentDeck: string[];
  savedDecks: any[];
  bonusCard: string | null;
  isValid: boolean;
  composition: {
    positions: Record<string, number>;
    rarities: Record<string, number>;
    totalCP: number;
  };
  isLoading: boolean;
  error: Error | null;
}

const initialState: DeckState = {
  userCards: [],
  currentDeck: [],
  savedDecks: [],
  bonusCard: null,
  isValid: false,
  composition: {
    positions: {},
    rarities: {},
    totalCP: 0,
  },
  isLoading: false,
  error: null,
};

export function deckReducer(
  state = initialState,
  action: DeckAction
): DeckState {
  switch (action.type) {
    case 'SET_USER_CARDS':
      return {
        ...state,
        userCards: action.payload,
      };

    case 'SET_CURRENT_DECK':
      return {
        ...state,
        currentDeck: action.payload,
      };

    case 'ADD_CARD_TO_DECK':
      if (state.currentDeck.length >= 8) return state;
      if (state.currentDeck.includes(action.payload)) return state;
      
      return {
        ...state,
        currentDeck: [...state.currentDeck, action.payload],
      };

    case 'REMOVE_CARD_FROM_DECK':
      return {
        ...state,
        currentDeck: state.currentDeck.filter(id => id !== action.payload),
      };

    case 'SELECT_BONUS_CARD':
      return {
        ...state,
        bonusCard: action.payload,
      };

    case 'SET_DECK_VALID':
      return {
        ...state,
        isValid: action.payload,
      };

    case 'UPDATE_COMPOSITION':
      return {
        ...state,
        composition: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}
```

```typescript
// store/reducers/shop.ts
import { ShopAction } from '../actions/shop';
import { SHOP_ACTION_TYPES } from '../actions/types';

export interface ShopState {
  packTypes: any[];
  purchases: any[];
  isLoading: boolean;
  error: Error | null;
  pendingPurchase: any | null;
}

const initialState: ShopState = {
  packTypes: [],
  purchases: [],
  isLoading: false,
  error: null,
  pendingPurchase: null,
};

export function shopReducer(
  state = initialState,
  action: ShopAction
): ShopState {
  switch (action.type) {
    case 'LOAD_PACKS':
      return {
        ...state,
        isLoading: true,
      };

    case 'SET_PACK_TYPES':
      return {
        ...state,
        packTypes: action.payload,
        isLoading: false,
      };

    case 'SET_PURCHASES':
      return {
        ...state,
        purchases: action.payload,
      };

    case 'ADD_PURCHASE':
      return {
        ...state,
        purchases: [action.payload, ...state.purchases],
      };

    case 'UPDATE_PURCHASE':
      return {
        ...state,
        purchases: state.purchases.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}
```

```typescript
// store/reducers/matchmaking.ts
import { MatchmakingAction } from '../actions/matchmaking';
import { MATCHMAKING_ACTION_TYPES } from '../actions/types';

export interface MatchmakingState {
  isSearching: boolean;
  searchTime: number;
  estimatedWaitTime: number;
  error: Error | null;
  foundGame: any | null;
}

const initialState: MatchmakingState = {
  isSearching: false,
  searchTime: 0,
  estimatedWaitTime: 30,
  error: null,
  foundGame: null,
};

export function matchmakingReducer(
  state = initialState,
  action: MatchmakingAction
): MatchmakingState {
  switch (action.type) {
    case 'START_SEARCH':
      return {
        ...state,
        isSearching: true,
        searchTime: 0,
        error: null,
        foundGame: null,
      };

    case 'MATCH_FOUND':
      return {
        ...state,
        isSearching: false,
        foundGame: action.payload,
      };

    case 'CANCEL_SEARCH':
      return {
        ...state,
        isSearching: false,
        searchTime: 0,
      };

    case 'UPDATE_SEARCH_TIME':
      return {
        ...state,
        searchTime: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isSearching: false,
      };

    default:
      return state;
  }
}
```

## 4. Root Reducer

```typescript
// store/reducers/index.ts
import { combineReducers } from 'redux';
import { authReducer } from './auth';
import { gameReducer } from './game';
import { deckReducer } from './deck';
import { shopReducer } from './shop';
import { matchmakingReducer } from './matchmaking';

export const rootReducer = combineReducers({
  auth: authReducer,
  game: gameReducer,
  deck: deckReducer,
  shop: shopReducer,
  matchmaking: matchmakingReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
```

## 5. Redux Store Configuration

```typescript
// store/store.ts
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { rootReducer } from './reducers';
import { createRealtimeMiddleware } from './middleware/realtime';
import { createPersistenceMiddleware } from './middleware/persistence';
import { createLoggingMiddleware } from './middleware/logging';

// Configuration du store
const composeEnhancers = 
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middleware = [
  thunk,
  createRealtimeMiddleware(),
  createPersistenceMiddleware(),
  createLoggingMiddleware(),
];

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

export type AppDispatch = typeof store.dispatch;
```

## 6. Middleware personnalisé

```typescript
// store/middleware/realtime.ts
import { Middleware } from 'redux';
import { supabase } from '@/services/supabase';

export const createRealtimeMiddleware = (): Middleware => {
  return (store) => (next) => (action) => {
    const result = next(action);

    // Synchroniser certaines actions avec Supabase Realtime
    switch (action.type) {
      case 'GAME/MAKE_MOVE':
      case 'GAME/PLACE_CARD':
        // Envoyer l'action via le channel realtime
        const state = store.getState();
        if (state.game.currentGame) {
          supabase
            .channel(`game:${state.game.currentGame.id}`)
            .send({
              type: 'broadcast',
              event: 'game_action',
              payload: action.payload,
            });
        }
        break;
    }

    return result;
  };
};
```

```typescript
// store/middleware/persistence.ts
import { Middleware } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const createPersistenceMiddleware = (): Middleware => {
  return (store) => (next) => (action) => {
    const result = next(action);

    // Persister certaines parties du state
    const state = store.getState();
    
    switch (action.type) {
      case 'AUTH/LOGIN_SUCCESS':
      case 'AUTH/UPDATE_PROFILE':
        AsyncStorage.setItem('auth', JSON.stringify(state.auth));
        break;
        
      case 'DECK/SAVE_DECK':
        AsyncStorage.setItem('savedDecks', JSON.stringify(state.deck.savedDecks));
        break;
    }

    return result;
  };
};
```

```typescript
// store/middleware/logging.ts
import { Middleware } from 'redux';

export const createLoggingMiddleware = (): Middleware => {
  return (store) => (next) => (action) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(action.type);
      console.info('dispatching', action);
      const result = next(action);
      console.log('next state', store.getState());
      console.groupEnd();
      return result;
    }
    
    return next(action);
  };
};
```

## 7. Hooks Redux personnalisés

```typescript
// store/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Hooks typés
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hooks de sélection personnalisés
export const useAuth = () => useAppSelector(state => state.auth);
export const useGame = () => useAppSelector(state => state.game);
export const useDeck = () => useAppSelector(state => state.deck);
export const useShop = () => useAppSelector(state => state.shop);
export const useMatchmaking = () => useAppSelector(state => state.matchmaking);

// Hook pour vérifier si c'est mon tour
export const useIsMyTurn = () => {
  const { currentGame } = useGame();
  const { user } = useAuth();
  
  return currentGame?.current_player === user?.id;
};

// Hook pour obtenir les stats du joueur
export const usePlayerStats = () => {
  const { profile } = useAuth();
  
  return {
    mmr: profile?.mmr || 1000,
    winRate: profile?.total_games > 0 
      ? (profile.wins / profile.total_games * 100).toFixed(1) 
      : 0,
    totalGames: profile?.total_games || 0,
  };
};
```

## 8. Selectors

```typescript
// store/selectors/game.ts
import { createSelector } from 'reselect';
import { RootState } from '../store';

// Sélecteurs de base
const selectGame = (state: RootState) => state.game;
const selectAuth = (state: RootState) => state.auth;

// Sélecteurs composés
export const selectCurrentPlayer = createSelector(
  [selectGame, selectAuth],
  (game, auth) => {
    if (!game.currentGame || !auth.user) return null;
    
    return game.currentGame.current_player === auth.user.id
      ? 'current'
      : 'opponent';
  }
);

export const selectMyTeam = createSelector(
  [selectGame, selectAuth],
  (game, auth) => {
    if (!game.currentGame || !auth.user) return null;
    
    return game.currentGame.player_a === auth.user.id ? 'A' : 'B';
  }
);

export const selectBoardState = createSelector(
  [selectGame],
  (game) => game.gameState?.boardState || {}
);

export const selectGameProgress = createSelector(
  [selectGame],
  (game) => {
    if (!game.currentGame) return 0;
    
    return (game.currentGame.current_turn / 10) * 100;
  }
);
```

```typescript
// store/selectors/deck.ts
import { createSelector } from 'reselect';
import { RootState } from '../store';

const selectDeck = (state: RootState) => state.deck;

export const selectDeckComposition = createSelector(
  [selectDeck],
  (deck) => {
    const composition = {
      positions: {} as Record<string, number>,
      rarities: {} as Record<string, number>,
      totalCP: 0,
    };

    deck.currentDeck.forEach(cardId => {
      const userCard = deck.userCards.find(uc => uc.player_id === cardId);
      if (!userCard?.card) return;

      const card = userCard.card;
      composition.positions[card.position] = 
        (composition.positions[card.position] || 0) + 1;
      composition.rarities[card.rarity] = 
        (composition.rarities[card.rarity] || 0) + 1;
      composition.totalCP += card.cp_cost;
    });

    return composition;
  }
);

export const selectDeckValidity = createSelector(
  [selectDeckComposition],
  (composition) => {
    return (
      composition.positions.gardien === 1 &&
      (composition.positions.defenseur || 0) >= 2 &&
      (composition.positions.milieu || 0) >= 2 &&
      (composition.positions.attaquant || 0) >= 2 &&
      (composition.rarities.Unique || 0) <= 1 &&
      (composition.rarities.SuperRare || 0) <= 2 &&
      (composition.rarities.Rare || 0) <= 3 &&
      composition.totalCP <= 20
    );
  }
);
```