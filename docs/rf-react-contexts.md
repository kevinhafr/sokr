# Rocket Footy - Contextes React

## 1. Auth Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Profile } from '@/types';
import { AuthService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

type AuthAction =
  | { type: 'SET_USER'; payload: { user: User; profile: Profile } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> };

const initialState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, ...action.payload }
          : null,
      };
    default:
      return state;
  }
};

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkBanStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialiser l'auth au démarrage
  useEffect(() => {
    checkAuthState();

    // Écouter les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'USER_UPDATED' && session?.user) {
          await loadUserProfile(session.user.id);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Vérifier la session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const user = { id: userId } as User;
      dispatch({ type: 'SET_USER', payload: { user, profile } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await AuthService.signIn(email, password);
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await AuthService.signUp(email, password, username);
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthService.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.profile) {
      throw new Error('No profile to update');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.profile.id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const checkBanStatus = async (): Promise<boolean> => {
    if (!state.profile) return false;

    if (state.profile.ban_until) {
      const banDate = new Date(state.profile.ban_until);
      const now = new Date();
      return banDate > now;
    }

    return false;
  };

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    checkBanStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## 2. Game Context

```typescript
// contexts/GameContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Game, Move, Placement, GameState, BoardState, GameStatus } from '@/types';
import { GameService } from '@/services/game';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';
import { useGameChannel } from '@/hooks/useGameChannel';

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
  | { type: 'RESET_GAME' };

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
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timer | null>(null);

  // Connexion au channel temps réel
  const { 
    connected, 
    sendMove, 
    sendCardPlacement,
    error: channelError 
  } = useGameChannel(gameId || '');

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
    if (state.currentGame && user) {
      const isMyTurn = state.currentGame.current_player === user.id;
      dispatch(prevState => ({
        ...prevState,
        isMyTurn,
      }));
    }
  }, [state.currentGame, user]);

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

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Envoyer via le channel
      await sendMove(action);

      // Appel API
      const { data, error } = await supabase.functions.invoke('make-move', {
        body: {
          gameId: state.currentGame.id,
          ...action,
        },
      });

      if (error) throw error;

      // Les mises à jour viendront via les subscriptions
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const placeCard = async (cardId: string, position: string) => {
    if (!state.currentGame || !state.isMyTurn) {
      throw new Error('Not your turn');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Envoyer via le channel
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
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
```

## 3. Deck Context

```typescript
// contexts/DeckContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PlayerCard, UserPlayer, SavedDeck, BonusCard } from '@/types';
import { CardService } from '@/services/cards';
import { supabase } from '@/services/supabase';
import { useAuth } from './AuthContext';

interface DeckState {
  userCards: UserPlayer[];
  currentDeck: string[];
  savedDecks: SavedDeck[];
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

type DeckAction =
  | { type: 'SET_USER_CARDS'; payload: UserPlayer[] }
  | { type: 'SET_CURRENT_DECK'; payload: string[] }
  | { type: 'SET_SAVED_DECKS'; payload: SavedDeck[] }
  | { type: 'SET_BONUS_CARD'; payload: string | null }
  | { type: 'ADD_CARD'; payload: string }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'SET_COMPOSITION'; payload: any }
  | { type: 'SET_VALID'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'ADD_SAVED_DECK'; payload: SavedDeck }
  | { type: 'REMOVE_SAVED_DECK'; payload: string };

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
  isLoading: true,
  error: null,
};

const deckReducer = (state: DeckState, action: DeckAction): DeckState => {
  switch (action.type) {
    case 'SET_USER_CARDS':
      return { ...state, userCards: action.payload, isLoading: false };
    case 'SET_CURRENT_DECK':
      return { ...state, currentDeck: action.payload };
    case 'SET_SAVED_DECKS':
      return { ...state, savedDecks: action.payload };
    case 'SET_BONUS_CARD':
      return { ...state, bonusCard: action.payload };
    case 'ADD_CARD':
      if (state.currentDeck.length >= 8) return state;
      return { ...state, currentDeck: [...state.currentDeck, action.payload] };
    case 'REMOVE_CARD':
      return {
        ...state,
        currentDeck: state.currentDeck.filter(id => id !== action.payload),
      };
    case 'SET_COMPOSITION':
      return { ...state, composition: action.payload };
    case 'SET_VALID':
      return { ...state, isValid: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_SAVED_DECK':
      return { ...state, savedDecks: [action.payload, ...state.savedDecks] };
    case 'REMOVE_SAVED_DECK':
      return {
        ...state,
        savedDecks: state.savedDecks.filter(deck => deck.id !== action.payload),
      };
    default:
      return state;
  }
};

interface DeckContextValue extends DeckState {
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  selectBonusCard: (cardId: string) => void;
  saveDeck: (name: string) => Promise<SavedDeck>;
  loadDeck: (deckId: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  validateDeck: () => Promise<boolean>;
  resetDeck: () => void;
  optimizeDeck: () => void;
}

const DeckContext = createContext<DeckContextValue | undefined>(undefined);

export function DeckProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(deckReducer, initialState);
  const { user } = useAuth();

  // Charger les cartes au démarrage
  useEffect(() => {
    if (user) {
      loadUserCards();
      loadSavedDecks();
    }
  }, [user]);

  // Valider le deck à chaque changement
  useEffect(() => {
    validateComposition();
  }, [state.currentDeck]);

  const loadUserCards = async () => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase
        .from('user_players')
        .select(`
          *,
          card:players(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'SET_USER_CARDS', payload: data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const loadSavedDecks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_SAVED_DECKS', payload: data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const validateComposition = () => {
    if (state.currentDeck.length !== 8) {
      dispatch({ type: 'SET_VALID', payload: false });
      return;
    }

    const positions: Record<string, number> = {};
    const rarities: Record<string, number> = {};
    let totalCP = 0;

    state.currentDeck.forEach(cardId => {
      const userCard = state.userCards.find(uc => uc.player_id === cardId);
      if (!userCard?.card) return;

      const card = userCard.card;
      positions[card.position] = (positions[card.position] || 0) + 1;
      rarities[card.rarity] = (rarities[card.rarity] || 0) + 1;
      totalCP += card.cp_cost;
    });

    // Vérifier les contraintes
    const valid =
      positions.gardien === 1 &&
      (positions.defenseur || 0) >= 2 &&
      (positions.milieu || 0) >= 2 &&
      (positions.attaquant || 0) >= 2 &&
      (rarities.Unique || 0) <= 1 &&
      (rarities.SuperRare || 0) <= 2 &&
      (rarities.Rare || 0) <= 3;

    dispatch({ type: 'SET_VALID', payload: valid });
    dispatch({ type: 'SET_COMPOSITION', payload: { positions, rarities, totalCP } });
  };

  const addCard = (cardId: string) => {
    if (state.currentDeck.includes(cardId)) return;
    dispatch({ type: 'ADD_CARD', payload: cardId });
  };

  const removeCard = (cardId: string) => {
    dispatch({ type: 'REMOVE_CARD', payload: cardId });
  };

  const selectBonusCard = (cardId: string) => {
    dispatch({ type: 'SET_BONUS_CARD', payload: cardId });
  };

  const saveDeck = async (name: string): Promise<SavedDeck> => {
    if (!user || !state.isValid) {
      throw new Error('Invalid deck');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase
        .from('saved_decks')
        .insert({
          user_id: user.id,
          name,
          cards: state.currentDeck,
          bonus_card: state.bonusCard,
          total_cp: state.composition.totalCP,
          is_valid: true,
        })
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_SAVED_DECK', payload: data });
      return data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadDeck = async (deckId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { data, error } = await supabase
        .from('saved_decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (error) throw error;

      dispatch({ type: 'SET_CURRENT_DECK', payload: data.cards });
      dispatch({ type: 'SET_BONUS_CARD', payload: data.bonus_card });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase
        .from('saved_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'REMOVE_SAVED_DECK', payload: deckId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const validateDeck = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-deck', {
        body: { cards: state.currentDeck },
      });

      if (error) throw error;

      return data.valid;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      return false;
    }
  };

  const resetDeck = () => {
    dispatch({ type: 'SET_CURRENT_DECK', payload: [] });
    dispatch({ type: 'SET_BONUS_CARD', payload: null });
  };

  const optimizeDeck = () => {
    // Logique d'optimisation automatique du deck
    // Basée sur les meilleures synergies et le budget CP
    const optimized = optimizeDeckAlgorithm(state.userCards);
    dispatch({ type: 'SET_CURRENT_DECK', payload: optimized });
  };

  const value: DeckContextValue = {
    ...state,
    addCard,
    removeCard,
    selectBonusCard,
    saveDeck,
    loadDeck,
    deleteDeck,
    validateDeck,
    resetDeck,
    optimizeDeck,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
}

export function useDeck() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
}

// Algorithme d'optimisation du deck
function optimizeDeckAlgorithm(userCards: UserPlayer[]): string[] {
  // Logique simplifiée d'optimisation
  const deck: string[] = [];
  const positionCounts = { gardien: 0, defenseur: 0, milieu: 0, attaquant: 0 };
  const rarityLimits = { Unique: 1, SuperRare: 2, Rare: 3 };
  let totalCP = 0;

  // Trier les cartes par ratio valeur/coût
  const sortedCards = [...userCards].sort((a, b) => {
    const valueA = (a.card.shot + a.card.dribble + a.card.pass + a.card.block) / a.card.cp_cost;
    const valueB = (b.card.shot + b.card.dribble + b.card.pass + b.card.block) / b.card.cp_cost;
    return valueB - valueA;
  });

  // Sélectionner les cartes optimales
  for (const userCard of sortedCards) {
    if (deck.length >= 8) break;

    const card = userCard.card;
    const position = card.position;
    const rarity = card.rarity;

    // Vérifier les contraintes
    if (
      (position === 'gardien' && positionCounts.gardien >= 1) ||
      (rarity in rarityLimits && positionCounts[rarity] >= rarityLimits[rarity]) ||
      totalCP + card.cp_cost > 20
    ) {
      continue;
    }

    deck.push(userCard.player_id);
    positionCounts[position]++;
    if (rarity in rarityLimits) {
      positionCounts[rarity]++;
    }
    totalCP += card.cp_cost;
  }

  // Vérifier qu'on a le minimum requis
  if (deck.length === 8 &&
    positionCounts.gardien >= 1 &&
    positionCounts.defenseur >= 2 &&
    positionCounts.milieu >= 2 &&
    positionCounts.attaquant >= 2) {
    return deck;
  }

  // Si le deck n'est pas valide, retourner un deck vide
  return [];
}
```

## 4. Theme Context

```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    border: string;
    divider: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    body1: any;
    body2: any;
    caption: any;
    button: any;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    sm: any;
    md: any;
    lg: any;
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#4CAF50',
    secondary: '#FF9800',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#212121',
    textSecondary: '#757575',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    border: '#E0E0E0',
    divider: '#BDBDBD',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body1: {
      fontSize: 16,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#66BB6A',
    secondary: '#FFB74D',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFB74D',
    info: '#42A5F5',
    border: '#424242',
    divider: '#616161',
  },
};

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'auto') => void;
  themeMode: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [isDark, setIsDark] = useState(false);

  // Charger la préférence de thème
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Mettre à jour le thème basé sur le mode
  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setThemeMode(savedMode as 'light' | 'dark' | 'auto');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: 'light' | 'dark' | 'auto') => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    saveThemePreference(newMode);
  };

  const handleSetThemeMode = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    saveThemePreference(mode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    theme,
    isDark,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
    themeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

## 5. Settings Context

```typescript
// contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { supabase } from '@/services/supabase';

interface Settings {
  sound: boolean;
  vibration: boolean;
  notifications: boolean;
  autoPlay: boolean;
  showTimer: boolean;
  confirmActions: boolean;
  language: string;
  graphicsQuality: 'low' | 'medium' | 'high';
}

interface SettingsContextValue {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const defaultSettings: Settings = {
  sound: true,
  vibration: true,
  notifications: true,
  autoPlay: false,
  showTimer: true,
  confirmActions: true,
  language: 'fr',
  graphicsQuality: 'medium',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Charger depuis le stockage local
      const localSettings = await AsyncStorage.getItem('settings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }

      // Si l'utilisateur est connecté, charger depuis le profil
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .single();

        if (profile?.settings) {
          const mergedSettings = { ...defaultSettings, ...profile.settings };
          setSettings(mergedSettings);
          await AsyncStorage.setItem('settings', JSON.stringify(mergedSettings));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      // Sauvegarder localement
      await AsyncStorage.setItem('settings', JSON.stringify(newSettings));

      // Si l'utilisateur est connecté, sauvegarder dans le profil
      if (user) {
        await supabase
          .from('profiles')
          .update({ settings: newSettings })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(defaultSettings));

      if (user) {
        await supabase
          .from('profiles')
          .update({ settings: defaultSettings })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  const value: SettingsContextValue = {
    settings,
    updateSetting,
    resetSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
```

## 6. Sound Context

```typescript
// contexts/SoundContext.tsx
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useSettings } from './SettingsContext';

interface SoundMap {
  [key: string]: Audio.Sound;
}

interface SoundContextValue {
  playSound: (soundName: string) => Promise<void>;
  stopSound: (soundName: string) => Promise<void>;
  playBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  setSoundVolume: (volume: number) => Promise<void>;
  preloadSounds: () => Promise<void>;
}

const soundAssets = {
  buttonClick: require('@/assets/sounds/button-click.mp3'),
  cardPlace: require('@/assets/sounds/card-place.mp3'),
  cardFlip: require('@/assets/sounds/card-flip.mp3'),
  diceRoll: require('@/assets/sounds/dice-roll.mp3'),
  goal: require('@/assets/sounds/goal.mp3'),
  whistle: require('@/assets/sounds/whistle.mp3'),
  victory: require('@/assets/sounds/victory.mp3'),
  defeat: require('@/assets/sounds/defeat.mp3'),
  timerWarning: require('@/assets/sounds/timer-warning.mp3'),
  backgroundMusic: require('@/assets/sounds/background-music.mp3'),
};

const SoundContext = createContext<SoundContextValue | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const sounds = useRef<SoundMap>({});
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Configurer l'audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });

    // Précharger les sons
    preloadSounds();

    return () => {
      // Nettoyer les sons
      Object.values(sounds.current).forEach(sound => {
        sound.unloadAsync();
      });
      if (backgroundMusic.current) {
        backgroundMusic.current.unloadAsync();
      }
    };
  }, []);

  const preloadSounds = async () => {
    try {
      for (const [name, asset] of Object.entries(soundAssets)) {
        if (name !== 'backgroundMusic') {
          const { sound } = await Audio.Sound.createAsync(asset);
          sounds.current[name] = sound;
        }
      }
    } catch (error) {
      console.error('Error preloading sounds:', error);
    }
  };

  const playSound = async (soundName: string) => {
    if (!settings.sound) return;

    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  const stopSound = async (soundName: string) => {
    try {
      const sound = sounds.current[soundName];
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.error(`Error stopping sound ${soundName}:`, error);
    }
  };

  const playBackgroundMusic = async () => {
    if (!settings.sound) return;

    try {
      if (!backgroundMusic.current) {
        const { sound } = await Audio.Sound.createAsync(
          soundAssets.backgroundMusic,
          { isLooping: true, volume: 0.3 }
        );
        backgroundMusic.current = sound;
      }
      await backgroundMusic.current.playAsync();
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (backgroundMusic.current) {
        await backgroundMusic.current.stopAsync();
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  };

  const setSoundVolume = async (volume: number) => {
    try {
      // Définir le volume pour tous les sons
      for (const sound of Object.values(sounds.current)) {
        await sound.setVolumeAsync(volume);
      }
      if (backgroundMusic.current) {
        await backgroundMusic.current.setVolumeAsync(volume * 0.3); // Musique de fond plus basse
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const value: SoundContextValue = {
    playSound,
    stopSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    setSoundVolume,
    preloadSounds,
  };

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
```

## 7. App Provider (Root Provider)

```typescript
// contexts/AppProvider.tsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { SettingsProvider } from './SettingsContext';
import { SoundProvider } from './SoundContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <SettingsProvider>
            <SoundProvider>
              {children}
            </SoundProvider>
          </SettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```