# Rocket Footy - Hooks Personnalisés

## 1. Hook useAuth

```typescript
// hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { User, Profile } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  checkBanStatus: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Initialisation et listener d'auth
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await loadProfile(user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState({
        user: { id: userId } as User,
        profile,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadProfile(data.user.id);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    username: string
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username,
            email,
          });

        if (profileError) throw profileError;

        // Attribuer le deck de départ
        await supabase.functions.invoke('assign-starter-deck', {
          body: { userId: authData.user.id }
        });

        await loadProfile(authData.user.id);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
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

      setState(prev => ({
        ...prev,
        profile: data,
      }));
    } catch (error) {
      throw error;
    }
  }, [state.profile]);

  const checkBanStatus = useCallback(async (): Promise<boolean> => {
    if (!state.profile) return false;

    if (state.profile.ban_until) {
      const banDate = new Date(state.profile.ban_until);
      const now = new Date();
      return banDate > now;
    }

    return false;
  }, [state.profile]);

  return {
    ...state,
    login,
    logout,
    register,
    updateProfile,
    checkBanStatus,
  };
}
```

## 2. Hook useGame

```typescript
// hooks/useGame.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Game, Move, MakeMoveRequest, PlaceCardRequest } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useGameChannel } from './useGameChannel';

interface UseGameReturn {
  game: Game | null;
  moves: Move[];
  isLoading: boolean;
  error: Error | null;
  isMyTurn: boolean;
  timeRemaining: number;
  makeMove: (move: MakeMoveRequest) => Promise<void>;
  placeCard: (placement: PlaceCardRequest) => Promise<void>;
  forfeit: () => Promise<void>;
  confirmPlacement: () => Promise<void>;
}

export function useGame(gameId: string): UseGameReturn {
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const { sendMove, sendCardPlacement } = useGameChannel(gameId);

  // Charger le jeu initial
  useEffect(() => {
    if (!gameId) return;

    loadGame();
    loadMoves();

    // S'abonner aux changements
    const gameSubscription = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setGame(payload.new as Game);
          }
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
          setMoves(prev => [...prev, payload.new as Move]);
        }
      )
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  // Gérer le timer du tour
  useEffect(() => {
    if (!game || !isMyTurn) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const turnStarted = game.turn_started_at ? new Date(game.turn_started_at) : new Date();
    const elapsed = Math.floor((Date.now() - turnStarted.getTime()) / 1000);
    const remaining = Math.max(0, 45 - elapsed);
    setTimeRemaining(remaining);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game, isMyTurn]);

  const loadGame = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoves = async () => {
    try {
      const { data, error } = await supabase
        .from('moves')
        .select('*')
        .eq('game_id', gameId)
        .order('turn_number', { ascending: true });

      if (error) throw error;
      setMoves(data || []);
    } catch (err) {
      setError(err as Error);
    }
  };

  const isMyTurn = game?.current_player === user?.id;

  const makeMove = useCallback(async (move: MakeMoveRequest) => {
    if (!isMyTurn) {
      throw new Error('Not your turn');
    }

    try {
      // Optimistic update
      await sendMove(move);

      // Appel API
      const { data, error } = await supabase.functions.invoke('make-move', {
        body: move,
      });

      if (error) throw error;

      // Les mises à jour viendront via realtime
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [isMyTurn, sendMove]);

  const placeCard = useCallback(async (placement: PlaceCardRequest) => {
    if (!isMyTurn) {
      throw new Error('Not your turn');
    }

    try {
      // Optimistic update
      await sendCardPlacement(placement);

      // Appel API
      const { data, error } = await supabase.functions.invoke('place-card', {
        body: placement,
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [isMyTurn, sendCardPlacement]);

  const forfeit = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke('forfeit', {
        body: { gameId },
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [gameId]);

  const confirmPlacement = useCallback(async () => {
    try {
      const { error } = await supabase.functions.invoke('confirm-placement', {
        body: { gameId },
      });

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [gameId]);

  const handleTimeout = useCallback(() => {
    // Le serveur gérera le timeout
    console.log('Turn timeout');
  }, []);

  return {
    game,
    moves,
    isLoading,
    error,
    isMyTurn,
    timeRemaining,
    makeMove,
    placeCard,
    forfeit,
    confirmPlacement,
  };
}
```

## 3. Hook useDeck

```typescript
// hooks/useDeck.ts
import { useState, useEffect, useCallback } from 'react';
import { UserPlayer, PlayerCard, SavedDeck } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface DeckComposition {
  positions: Record<string, number>;
  rarities: Record<string, number>;
  totalCP: number;
}

interface UseDeckReturn {
  userCards: UserPlayer[];
  deck: string[];
  bonusCard: string | null;
  savedDecks: SavedDeck[];
  isValid: boolean;
  composition: DeckComposition;
  isLoading: boolean;
  error: Error | null;
  addCard: (cardId: string) => void;
  removeCard: (cardId: string) => void;
  selectBonusCard: (cardId: string) => void;
  saveDeck: (name: string) => Promise<void>;
  loadDeck: (deckId: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  validateDeck: () => Promise<boolean>;
}

export function useDeck(): UseDeckReturn {
  const { user } = useAuth();
  const [userCards, setUserCards] = useState<UserPlayer[]>([]);
  const [deck, setDeck] = useState<string[]>([]);
  const [bonusCard, setBonusCard] = useState<string | null>(null);
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [composition, setComposition] = useState<DeckComposition>({
    positions: {},
    rarities: {},
    totalCP: 0,
  });

  // Charger les cartes de l'utilisateur
  useEffect(() => {
    if (!user) return;

    loadUserCards();
    loadSavedDecks();
  }, [user]);

  // Valider le deck à chaque changement
  useEffect(() => {
    validateDeckComposition();
  }, [deck]);

  const loadUserCards = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_players')
        .select(`
          *,
          card:players(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserCards(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
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
      setSavedDecks(data || []);
    } catch (err) {
      setError(err as Error);
    }
  };

  const addCard = useCallback((cardId: string) => {
    if (deck.length >= 8) return;
    if (deck.includes(cardId)) return;

    setDeck(prev => [...prev, cardId]);
  }, [deck]);

  const removeCard = useCallback((cardId: string) => {
    setDeck(prev => prev.filter(id => id !== cardId));
  }, []);

  const selectBonusCard = useCallback((cardId: string) => {
    setBonusCard(cardId);
  }, []);

  const validateDeckComposition = () => {
    if (deck.length !== 8) {
      setIsValid(false);
      return;
    }

    const positions: Record<string, number> = {};
    const rarities: Record<string, number> = {};
    let totalCP = 0;

    deck.forEach(cardId => {
      const userCard = userCards.find(uc => uc.player_id === cardId);
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

    setIsValid(valid);
    setComposition({ positions, rarities, totalCP });
  };

  const saveDeck = useCallback(async (name: string) => {
    if (!user || !isValid) {
      throw new Error('Invalid deck');
    }

    try {
      const { data, error } = await supabase
        .from('saved_decks')
        .insert({
          user_id: user.id,
          name,
          cards: deck,
          bonus_card: bonusCard,
          total_cp: composition.totalCP,
          is_valid: true,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDecks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [user, deck, bonusCard, isValid, composition]);

  const loadDeck = useCallback(async (deckId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (error) throw error;

      setDeck(data.cards);
      setBonusCard(data.bonus_card);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const deleteDeck = useCallback(async (deckId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedDecks(prev => prev.filter(d => d.id !== deckId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [user]);

  const validateDeck = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-deck', {
        body: {
          cards: deck,
        },
      });

      if (error) throw error;

      return data.valid;
    } catch (err) {
      setError(err as Error);
      return false;
    }
  }, [deck]);

  return {
    userCards,
    deck,
    bonusCard,
    savedDecks,
    isValid,
    composition,
    isLoading,
    error,
    addCard,
    removeCard,
    selectBonusCard,
    saveDeck,
    loadDeck,
    deleteDeck,
    validateDeck,
  };
}
```

## 4. Hook useMatchmaking

```typescript
// hooks/useMatchmaking.ts
import { useState, useEffect, useCallback } from 'react';
import { Game, GameMode } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useRouter } from '@/navigation';

interface UseMatchmakingReturn {
  isSearching: boolean;
  searchingTime: number;
  estimatedWaitTime: number;
  error: Error | null;
  findMatch: (mode: GameMode, deckId?: string) => Promise<void>;
  cancelSearch: () => Promise<void>;
}

export function useMatchmaking(): UseMatchmakingReturn {
  const { user } = useAuth();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [searchingTime, setSearchingTime] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(30);
  const [error, setError] = useState<Error | null>(null);
  const [searchTimerRef, setSearchTimerRef] = useState<NodeJS.Timer | null>(null);

  // Timer de recherche
  useEffect(() => {
    if (isSearching) {
      const timer = setInterval(() => {
        setSearchingTime(prev => prev + 1);
      }, 1000);
      setSearchTimerRef(timer);

      return () => clearInterval(timer);
    } else {
      setSearchingTime(0);
      if (searchTimerRef) {
        clearInterval(searchTimerRef);
      }
    }
  }, [isSearching]);

  const findMatch = useCallback(async (mode: GameMode, deckId?: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsSearching(true);
      setError(null);

      // Appeler la fonction de matchmaking
      const { data, error } = await supabase.functions.invoke('matchmake', {
        body: {
          mode,
          deckId,
        },
      });

      if (error) throw error;

      if (data.action === 'joined' || data.action === 'created') {
        // Naviguer vers le jeu
        router.navigate('Game', { gameId: data.game.id });
        setIsSearching(false);
      }

      // Si on a créé une partie, attendre un adversaire
      if (data.action === 'created') {
        // S'abonner aux changements de la partie
        const subscription = supabase
          .channel(`game:${data.game.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'games',
              filter: `id=eq.${data.game.id}`,
            },
            (payload) => {
              if (payload.new.player_b) {
                // Un adversaire a rejoint
                router.navigate('Game', { gameId: data.game.id });
                setIsSearching(false);
                subscription.unsubscribe();
              }
            }
          )
          .subscribe();

        // Timeout après 45 secondes
        setTimeout(() => {
          if (isSearching) {
            subscription.unsubscribe();
            // Le serveur créera une partie contre l'IA
          }
        }, 45000);
      }
    } catch (err) {
      setError(err as Error);
      setIsSearching(false);
      throw err;
    }
  }, [user, router, isSearching]);

  const cancelSearch = useCallback(async () => {
    if (!isSearching) return;

    try {
      // Annuler la recherche côté serveur si nécessaire
      setIsSearching(false);
    } catch (err) {
      setError(err as Error);
    }
  }, [isSearching]);

  return {
    isSearching,
    searchingTime,
    estimatedWaitTime,
    error,
    findMatch,
    cancelSearch,
  };
}
```

## 5. Hook useShop

```typescript
// hooks/useShop.ts
import { useState, useEffect, useCallback } from 'react';
import { PackType, Purchase, PlayerCard } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UseShopReturn {
  packTypes: PackType[];
  purchases: Purchase[];
  isLoading: boolean;
  error: Error | null;
  purchasePack: (packTypeId: string, paymentToken: string) => Promise<Purchase>;
  openPack: (purchaseId: string) => Promise<PlayerCard[]>;
  loadPurchaseHistory: () => Promise<void>;
}

export function useShop(): UseShopReturn {
  const { user } = useAuth();
  const [packTypes, setPackTypes] = useState<PackType[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    loadPackTypes();
    loadPurchaseHistory();
  }, [user]);

  const loadPackTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pack_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setPackTypes(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPurchaseHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          pack_type:pack_types(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      setError(err as Error);
    }
  };

  const purchasePack = useCallback(async (
    packTypeId: string,
    paymentToken: string
  ): Promise<Purchase> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Traiter le paiement (à implémenter selon la plateforme)
      const platform = detectPlatform();
      
      const { data, error } = await supabase.functions.invoke('process-purchase', {
        body: {
          packTypeId,
          paymentToken,
          platform,
        },
      });

      if (error) throw error;

      // Ajouter à l'historique
      setPurchases(prev => [data, ...prev]);

      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [user]);

  const openPack = useCallback(async (purchaseId: string): Promise<PlayerCard[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('open-pack', {
        body: {
          purchaseId,
        },
      });

      if (error) throw error;

      // Mettre à jour l'achat comme ouvert
      setPurchases(prev => 
        prev.map(p => 
          p.id === purchaseId 
            ? { ...p, opened_at: new Date().toISOString(), cards_received: data.cards }
            : p
        )
      );

      return data.cards;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    packTypes,
    purchases,
    isLoading,
    error,
    purchasePack,
    openPack,
    loadPurchaseHistory,
  };
}

function detectPlatform(): string {
  // Détecter la plateforme (iOS, Android, Web)
  // Implémentation simplifiée
  return 'web';
}
```

## 6. Hook usePlayerData

```typescript
// hooks/usePlayerData.ts
import { useState, useEffect } from 'react';
import { PlayerCard, UserPlayer } from '@/types';
import { supabase } from '@/lib/supabase';

interface UsePlayerDataReturn {
  playerCard: PlayerCard | null;
  userPlayerCard: UserPlayer | null;
  isLoading: boolean;
  error: Error | null;
}

export function usePlayerData(
  cardId?: string,
  playerId?: string
): UsePlayerDataReturn {
  const [playerCard, setPlayerCard] = useState<PlayerCard | null>(null);
  const [userPlayerCard, setUserPlayerCard] = useState<UserPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cardId) {
      setIsLoading(false);
      return;
    }

    loadPlayerData();
  }, [cardId, playerId]);

  const loadPlayerData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les données de base de la carte
      const { data: cardData, error: cardError } = await supabase
        .from('players')
        .select('*')
        .eq('id', cardId)
        .single();

      if (cardError) throw cardError;
      setPlayerCard(cardData);

      // Si on a un playerId, charger les données utilisateur
      if (playerId) {
        const { data: userData, error: userError } = await supabase
          .from('user_players')
          .select('*')
          .eq('player_id', cardId)
          .eq('user_id', playerId)
          .single();

        if (!userError && userData) {
          setUserPlayerCard(userData);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    playerCard,
    userPlayerCard,
    isLoading,
    error,
  };
}
```

## 7. Hook useLeaderboard

```typescript
// hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/types';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry extends Profile {
  rank: number;
  winRate: number;
}

interface UseLeaderboardReturn {
  global: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  userRank: number | null;
  isLoading: boolean;
  error: Error | null;
  refreshLeaderboard: () => Promise<void>;
  loadMoreGlobal: () => Promise<void>;
}

export function useLeaderboard(): UseLeaderboardReturn {
  const [global, setGlobal] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      
      // Charger le classement global
      const { data: globalData, error: globalError } = await supabase
        .from('profiles')
        .select('*')
        .order('mmr', { ascending: false })
        .limit(50);

      if (globalError) throw globalError;

      const leaderboard = globalData.map((profile, index) => ({
        ...profile,
        rank: index + 1,
        winRate: profile.total_games > 0 
          ? (profile.wins / profile.total_games) * 100 
          : 0,
      }));

      setGlobal(leaderboard);

      // Charger le rang de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userEntry = leaderboard.find(entry => entry.id === user.id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        } else {
          // Si l'utilisateur n'est pas dans le top 50, chercher son rang
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('mmr', userEntry?.mmr || 0);

          setUserRank((count || 0) + 1);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLeaderboard = useCallback(async () => {
    setPage(0);
    setHasMore(true);
    await loadLeaderboard();
  }, []);

  const loadMoreGlobal = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const offset = (page + 1) * 50;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('mmr', { ascending: false })
        .range(offset, offset + 49);

      if (error) throw error;

      if (data && data.length > 0) {
        const newEntries = data.map((profile, index) => ({
          ...profile,
          rank: offset + index + 1,
          winRate: profile.total_games > 0 
            ? (profile.wins / profile.total_games) * 100 
            : 0,
        }));

        setGlobal(prev => [...prev, ...newEntries]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  return {
    global,
    friends,
    userRank,
    isLoading,
    error,
    refreshLeaderboard,
    loadMoreGlobal,
  };
}
```

## 8. Hook useNotifications

```typescript
// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
    setupNotificationHandlers();
    
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    
    if (status === 'granted' && user) {
      // Enregistrer le token push
      const token = await Notifications.getExpoPushTokenAsync();
      await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: token.data,
          platform: Platform.OS,
        });
    }
    
    return status === 'granted';
  };

  const setupNotificationHandlers = () => {
    // Handler pour les notifications reçues pendant que l'app est ouverte
    Notifications.addNotificationReceivedListener((notification) => {
      const newNotification: Notification = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    });

    // Handler pour les interactions avec les notifications
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.gameId) {
        // Naviguer vers le jeu
        // router.navigate('Game', { gameId: data.gameId });
      }
    });
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user]);

  const clearNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    hasPermission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
```

## 9. Hook useDebounce

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 10. Hook useInterval

```typescript
// hooks/useInterval.ts
import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  // Se souvenir de la dernière callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configurer l'intervalle
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
```