import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { PlayerCard } from '../types/models';
import { useAuth } from '../contexts/AuthContext';

interface UsePlayerCardsReturn {
  cards: PlayerCard[];
  isLoading: boolean;
  error: Error | null;
}

export function usePlayerCards(gameId: string, deckId?: string | null): UsePlayerCardsReturn {
  const { userId } = useAuth();
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!deckId || !userId) {
      setIsLoading(false);
      return;
    }

    loadCards();
  }, [deckId, userId]);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First get the deck to find card IDs
      const { data: deck, error: deckError } = await supabase
        .from('saved_decks')
        .select('cards')
        .eq('id', deckId)
        .single();

      if (deckError) throw deckError;

      if (!deck || !deck.cards || deck.cards.length === 0) {
        setCards([]);
        return;
      }

      // Then get the player cards
      const { data: playerCards, error: cardsError } = await supabase
        .from('player_cards')
        .select('*')
        .in('id', deck.cards);

      if (cardsError) throw cardsError;

      setCards(playerCards || []);
    } catch (err) {
      console.error('Error loading player cards:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { cards, isLoading, error };
}