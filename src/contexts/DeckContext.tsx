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