// hooks/useMatchmaking.ts
import { useState, useEffect, useCallback } from 'react';
import { GameMode } from '@/types/base';
import { Game } from '@/types/models';
import { supabase } from '@/services/supabase';
import { useAuth } from './useAuth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/types';

interface UseMatchmakingReturn {
  isSearching: boolean;
  searchingTime: number;
  estimatedWaitTime: number;
  error: Error | null;
  findMatch: (mode: GameMode, deckId?: string) => Promise<void>;
  cancelSearch: () => Promise<void>;
}

export function useMatchmaking(): UseMatchmakingReturn {
  const { userId } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
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
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      setIsSearching(true);
      setError(null);

      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Appeler la fonction de matchmaking
      const { data, error } = await supabase.functions.invoke('matchmake', {
        body: {
          mode,
          deckId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.action === 'joined' || data.action === 'created') {
        // Naviguer vers l'écran de matchmaking
        navigation.navigate('Matchmaking', { gameId: data.game.id });
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
                // Un adversaire a rejoint - déjà navigué vers Matchmaking
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
  }, [userId, navigation, isSearching]);

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