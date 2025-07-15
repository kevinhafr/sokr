// hooks/usePlayerData.ts
import { useState, useEffect } from 'react';
import { PlayerCard, UserPlayer } from '@/types';
import { supabase } from '@/services/supabase';

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