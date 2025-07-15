// services/api.ts
import { supabase } from './supabase';
import { 
  Game, 
  MakeMoveRequest, 
  PlaceCardRequest,
  CreateGameRequest,
  MatchmakeRequest 
} from '@/types';

export class ApiService {
  // Games
  static async createGame(request: CreateGameRequest) {
    const { data, error } = await supabase.functions.invoke('create-game', {
      body: request,
    });
    
    if (error) throw error;
    return data;
  }

  static async getGame(gameId: string): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        player_a_profile:profiles!player_a(*),
        player_b_profile:profiles!player_b(*)
      `)
      .eq('id', gameId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async makeMove(request: MakeMoveRequest) {
    const { data, error } = await supabase.functions.invoke('make-move', {
      body: request,
    });
    
    if (error) throw error;
    return data;
  }

  static async placeCard(request: PlaceCardRequest) {
    const { data, error } = await supabase.functions.invoke('place-card', {
      body: request,
    });
    
    if (error) throw error;
    return data;
  }

  static async forfeitGame(gameId: string) {
    const { data, error } = await supabase.functions.invoke('forfeit', {
      body: { gameId },
    });
    
    if (error) throw error;
    return data;
  }

  // Matchmaking
  static async findMatch(request: MatchmakeRequest) {
    const { data, error } = await supabase.functions.invoke('matchmake', {
      body: request,
    });
    
    if (error) throw error;
    return data;
  }

  static async joinWithCode(inviteCode: string) {
    const { data, error } = await supabase.functions.invoke('join-game', {
      body: { inviteCode },
    });
    
    if (error) throw error;
    return data;
  }

  // Decks
  static async validateDeck(cards: string[]) {
    const { data, error } = await supabase.functions.invoke('validate-deck', {
      body: { cards },
    });
    
    if (error) throw error;
    return data;
  }

  static async saveDeck(name: string, cards: string[], bonusCard?: string) {
    const { data, error } = await supabase.functions.invoke('save-deck', {
      body: { name, cards, bonusCard },
    });
    
    if (error) throw error;
    return data;
  }

  static async getDecks(userId: string) {
    const { data, error } = await supabase
      .from('saved_decks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // User Cards
  static async getUserCards(userId: string) {
    const { data, error } = await supabase
      .from('user_players')
      .select(`
        *,
        card:players(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  static async upgradeCard(userCardId: string, stat: string) {
    const { data, error } = await supabase.functions.invoke('upgrade-card', {
      body: { userCardId, stat },
    });
    
    if (error) throw error;
    return data;
  }

  // Shop
  static async getPackTypes() {
    const { data, error } = await supabase
      .from('pack_types')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) throw error;
    return data;
  }

  static async purchasePack(packTypeId: string, paymentToken: string) {
    const { data, error } = await supabase.functions.invoke('purchase-pack', {
      body: { packTypeId, paymentToken },
    });
    
    if (error) throw error;
    return data;
  }

  static async openPack(purchaseId: string) {
    const { data, error } = await supabase.functions.invoke('open-pack', {
      body: { purchaseId },
    });
    
    if (error) throw error;
    return data;
  }

  // Leaderboard
  static async getLeaderboard(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('mmr', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  static async getUserRank(userId: string) {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('mmr', (
        select => select
          .from('profiles')
          .select('mmr')
          .eq('id', userId)
          .single()
      ));
    
    if (error) throw error;
    return (count || 0) + 1;
  }

  // Analytics
  static async trackEvent(eventName: string, properties: any) {
    const { error } = await supabase.functions.invoke('track-event', {
      body: { eventName, properties },
    });
    
    if (error) console.error('Analytics error:', error);
  }
}