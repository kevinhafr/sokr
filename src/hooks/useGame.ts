// hooks/useGame.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Game, Move, MakeMoveRequest, PlaceCardRequest } from '@/types';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';
import { useGameChannel } from '@/contexts/GameChannelContext';

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
  const { userId } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const { sendMove, sendCardPlacement } = useGameChannel();
  
  // Calculate isMyTurn
  const isMyTurn = game?.current_player === userId;

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