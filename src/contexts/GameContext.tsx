// contexts/GameContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Game, Move, Placement, GameState, BoardState, GameStatus } from '@/types';
import { GameService } from '@/services/game';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';
import { GameSyncManager } from '@/lib/sync/GameSyncManager';
import { useGameChannel } from './GameChannelContext';

interface GameContextState {
  currentGame: Game | null;
  gameState: GameState | null;
  moves: Move[];
  placements: Placement[];
  isLoading: boolean;
  error: Error | null;
  isMyTurn: boolean;
  timeRemaining: number;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

type GameAction =
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> }
  | { type: 'ADD_MOVE'; payload: Move }
  | { type: 'ADD_PLACEMENT'; payload: Placement }
  | { type: 'SET_MOVES'; payload: Move[] }
  | { type: 'SET_PLACEMENTS'; payload: Placement[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_TIME_REMAINING'; payload: number }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'disconnected' | 'reconnecting' }
  | { type: 'RESET_GAME' }
  | { type: 'REALTIME_STATE_UPDATE'; payload: any }
  | { type: 'REALTIME_GAME_EVENT'; payload: any }
  | { type: 'REALTIME_PLAYER_STATUS'; payload: any }
  | { type: 'SYNC_COMPLETE'; payload: any }
  | { type: 'MOVE_START'; payload: any }
  | { type: 'MOVE_SUCCESS'; payload: any }
  | { type: 'MOVE_ERROR'; payload: any }
  | { type: 'PLACEMENT_START'; payload: any }
  | { type: 'PLACEMENT_SUCCESS'; payload: any }
  | { type: 'PLACEMENT_ERROR'; payload: any };

const initialState: GameContextState = {
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

const gameReducer = (state: GameContextState, action: GameAction): GameContextState => {
  switch (action.type) {
    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        gameState: action.payload.game_state,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        gameState: state.gameState
          ? { ...state.gameState, ...action.payload }
          : null,
      };
    case 'ADD_MOVE':
      return {
        ...state,
        moves: [...state.moves, action.payload],
      };
    case 'ADD_PLACEMENT':
      return {
        ...state,
        placements: [...state.placements, action.payload],
      };
    case 'SET_MOVES':
      return { ...state, moves: action.payload };
    case 'SET_PLACEMENTS':
      return { ...state, placements: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TIME_REMAINING':
      return { ...state, timeRemaining: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'RESET_GAME':
      return initialState;
    case 'REALTIME_STATE_UPDATE':
      // Gérer les mises à jour d'état depuis le channel
      if (action.payload.type === 'DB_UPDATE') {
        return {
          ...state,
          currentGame: action.payload.new,
          gameState: action.payload.new.game_state,
        };
      }
      return state;
    case 'REALTIME_GAME_EVENT':
      // Gérer les événements de jeu
      if (action.payload.type === 'NEW_MOVE') {
        return {
          ...state,
          moves: [...state.moves, action.payload.move],
        };
      }
      if (action.payload.type === 'CARD_PLACED') {
        return {
          ...state,
          placements: [...state.placements, action.payload.placement],
        };
      }
      return state;
    case 'REALTIME_PLAYER_STATUS':
      // Gérer les changements de statut des joueurs
      return state;
    case 'SYNC_COMPLETE':
      return {
        ...state,
        currentGame: action.payload,
        gameState: action.payload.game_state,
      };
    case 'MOVE_START':
      return { ...state, isLoading: true };
    case 'MOVE_SUCCESS':
      return { ...state, isLoading: false };
    case 'MOVE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'PLACEMENT_START':
      return { ...state, isLoading: true };
    case 'PLACEMENT_SUCCESS':
      return { ...state, isLoading: false };
    case 'PLACEMENT_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
};

interface GameContextValue extends GameContextState {
  loadGame: (gameId: string) => Promise<void>;
  makeMove: (action: any) => Promise<void>;
  placeCard: (cardId: string, position: string) => Promise<void>;
  confirmPlacement: () => Promise<void>;
  forfeit: () => Promise<void>;
  playBonusCard: (cardId: string) => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ 
  children, 
  gameId 
}: { 
  children: React.ReactNode;
  gameId?: string;
}) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { userId } = useAuth();
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const syncManagerRef = useRef<GameSyncManager | null>(null);
  const channelManagerRef = useRef<any>(null);

  // Get channel functions from GameChannelContext
  const { 
    connected, 
    sendMove, 
    sendCardPlacement,
    error: channelError,
    setGameDispatch 
  } = useGameChannel();
  
  // Register dispatch with channel context
  useEffect(() => {
    setGameDispatch(dispatch);
  }, [setGameDispatch]);

  // Initialiser le gestionnaire de synchronisation
  useEffect(() => {
    if (connected && gameId && channelManagerRef.current) {
      syncManagerRef.current = new GameSyncManager(
        gameId,
        channelManagerRef.current,
        (syncedState) => {
          dispatch({
            type: 'SYNC_COMPLETE',
            payload: syncedState
          });
        }
      );

      syncManagerRef.current.startPeriodicSync();

      return () => {
        syncManagerRef.current?.stopPeriodicSync();
      };
    }
  }, [connected, gameId]);

  // Mettre à jour le statut de connexion
  useEffect(() => {
    dispatch({ 
      type: 'SET_CONNECTION_STATUS', 
      payload: connected ? 'connected' : 'disconnected' 
    });
  }, [connected]);

  // Gérer les erreurs de channel
  useEffect(() => {
    if (channelError) {
      dispatch({ type: 'SET_ERROR', payload: channelError });
    }
  }, [channelError]);

  // Charger le jeu au démarrage
  useEffect(() => {
    if (gameId) {
      loadGame(gameId);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  // Gérer le timer
  useEffect(() => {
    if (!state.currentGame || !state.isMyTurn) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const turnStarted = state.currentGame.turn_started_at
      ? new Date(state.currentGame.turn_started_at)
      : new Date();
    
    const elapsed = Math.floor((Date.now() - turnStarted.getTime()) / 1000);
    const remaining = Math.max(0, 45 - elapsed);
    
    dispatch({ type: 'SET_TIME_REMAINING', payload: remaining });

    timerRef.current = setInterval(() => {
      dispatch(prevState => ({
        type: 'SET_TIME_REMAINING',
        payload: Math.max(0, prevState.timeRemaining - 1),
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.currentGame, state.isMyTurn]);

  // Calculer isMyTurn
  useEffect(() => {
    if (state.currentGame && userId) {
      const isMyTurn = state.currentGame.current_player === userId;
      dispatch(prevState => ({
        ...prevState,
        isMyTurn,
      }));
    }
  }, [state.currentGame, userId]);

  const loadGame = async (gameId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Charger les données du jeu
      const [game, moves, placements] = await Promise.all([
        GameService.getGame(gameId),
        GameService.getGameMoves(gameId),
        GameService.getPlacements(gameId),
      ]);

      dispatch({ type: 'SET_GAME', payload: game });
      dispatch({ type: 'SET_MOVES', payload: moves });
      dispatch({ type: 'SET_PLACEMENTS', payload: placements });

      // S'abonner aux changements
      subscribeToGameUpdates(gameId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const subscribeToGameUpdates = (gameId: string) => {
    // S'abonner aux changements de la table games
    const gameSubscription = supabase
      .channel(`game-updates:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          dispatch({ type: 'SET_GAME', payload: payload.new as Game });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'moves',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          dispatch({ type: 'ADD_MOVE', payload: payload.new as Move });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'placements',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          dispatch({ type: 'ADD_PLACEMENT', payload: payload.new as Placement });
        }
      )
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
    };
  };

  const makeMove = async (action: any) => {
    if (!state.currentGame || !state.isMyTurn) {
      throw new Error('Not your turn');
    }

    // Optimistic update
    dispatch({ type: 'MOVE_START', payload: action });
    
    try {
      // Envoyer via channel
      await sendMove(action);
      
      // Envoyer à l'API
      const { data, error } = await supabase.functions.invoke('make-move', {
        body: {
          gameId: state.currentGame.id,
          ...action,
        },
      });

      if (error) throw error;
      
      dispatch({ type: 'MOVE_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'MOVE_ERROR', payload: error });
      throw error;
    }
  };

  const placeCard = async (cardId: string, position: string) => {
    if (!state.currentGame || !state.isMyTurn) {
      throw new Error('Not your turn');
    }

    dispatch({ type: 'PLACEMENT_START', payload: { cardId, position } });
    
    try {
      // Envoyer via channel
      await sendCardPlacement({ cardId, position });
      
      // Appel API
      const { data, error } = await supabase.functions.invoke('place-card', {
        body: {
          gameId: state.currentGame.id,
          cardId,
          position,
        },
      });

      if (error) throw error;
      
      dispatch({ type: 'PLACEMENT_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'PLACEMENT_ERROR', payload: error });
      throw error;
    }
  };

  const confirmPlacement = async () => {
    if (!state.currentGame) {
      throw new Error('No game in progress');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.functions.invoke('confirm-placement', {
        body: { gameId: state.currentGame.id },
      });

      if (error) throw error;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const forfeit = async () => {
    if (!state.currentGame) {
      throw new Error('No game in progress');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.functions.invoke('forfeit', {
        body: { gameId: state.currentGame.id },
      });

      if (error) throw error;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const playBonusCard = async (cardId: string) => {
    if (!state.currentGame) {
      throw new Error('No game in progress');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase.functions.invoke('play-bonus-card', {
        body: {
          gameId: state.currentGame.id,
          cardId,
        },
      });

      if (error) throw error;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: GameContextValue = {
    ...state,
    loadGame,
    makeMove,
    placeCard,
    confirmPlacement,
    forfeit,
    playBonusCard,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}