import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useDefaultDeck() {
  const { userId } = useAuth();
  const [deckId, setDeckId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    loadDefaultDeck();
  }, [userId]);

  const loadDefaultDeck = async () => {
    try {
      // First try to get favorite deck
      let { data: favoriteDeck, error } = await supabase
        .from('saved_decks')
        .select('id')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .eq('is_valid', true)
        .single();

      if (favoriteDeck) {
        setDeckId(favoriteDeck.id);
        return;
      }

      // If no favorite, get first valid deck
      const { data: anyDeck, error: anyError } = await supabase
        .from('saved_decks')
        .select('id')
        .eq('user_id', userId)
        .eq('is_valid', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (anyDeck) {
        setDeckId(anyDeck.id);
      }
    } catch (error) {
      console.error('Error loading default deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { deckId, isLoading };
}