# Rocket Footy - Services & API

## 1. Service Supabase Client

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper pour obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper pour obtenir le token JWT
export const getAuthToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.access_token;
};
```

## 2. API Service Principal

```typescript
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
```

## 3. Auth Service

```typescript
// services/auth.ts
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  static async signUp(email: string, password: string, username: string) {
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

      if (profileError) {
        // Rollback: supprimer l'utilisateur si la création du profil échoue
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Attribuer le deck de départ
      const { error: deckError } = await supabase.functions.invoke('assign-starter-deck', {
        body: { userId: authData.user.id }
      });

      if (deckError) console.error('Error assigning starter deck:', deckError);
    }

    return authData;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Vérifier si l'utilisateur est banni
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ban_until')
        .eq('id', data.user.id)
        .single();

      if (profile?.ban_until && new Date(profile.ban_until) > new Date()) {
        await supabase.auth.signOut();
        throw new Error(`Account banned until ${new Date(profile.ban_until).toLocaleString()}`);
      }
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Nettoyer le cache local
    await AsyncStorage.multiRemove([
      'supabase.auth.token',
      'currentGame',
      'currentDeck',
    ]);
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'rocketfooty://reset-password',
    });

    if (error) throw error;
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }

  static async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Supprimer toutes les données de l'utilisateur
    const { error } = await supabase.functions.invoke('delete-account', {
      body: { userId: user.id }
    });

    if (error) throw error;

    // Se déconnecter
    await this.signOut();
  }
}
```

## 4. Game Service

```typescript
// services/game.ts
import { supabase } from './supabase';
import { Game, GameState, Move, Placement } from '@/types';

export class GameService {
  static async loadGameHistory(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        player_a_profile:profiles!player_a(username, mmr),
        player_b_profile:profiles!player_b(username, mmr)
      `)
      .or(`player_a.eq.${userId},player_b.eq.${userId}`)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getGameMoves(gameId: string) {
    const { data, error } = await supabase
      .from('moves')
      .select(`
        *,
        actor_card:players!actor_card_id(*),
        target_card:players!target_card_id(*)
      `)
      .eq('game_id', gameId)
      .order('turn_number');

    if (error) throw error;
    return data;
  }

  static async getPlacements(gameId: string) {
    const { data, error } = await supabase
      .from('placements')
      .select(`
        *,
        card:players(*)
      `)
      .eq('game_id', gameId)
      .order('placement_order');

    if (error) throw error;
    return data;
  }

  static async getReplayData(gameId: string) {
    const [game, moves, placements] = await Promise.all([
      this.getGame(gameId),
      this.getGameMoves(gameId),
      this.getPlacements(gameId),
    ]);

    return {
      game,
      moves,
      placements,
    };
  }

  static async simulateGame(gameState: GameState, moves: Move[]) {
    // Simulation locale du jeu pour les replays
    const simulation = new GameSimulation(gameState);
    
    for (const move of moves) {
      simulation.applyMove(move);
    }
    
    return simulation.getState();
  }

  private static async getGame(gameId: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return data;
  }
}

// Classe pour simuler localement une partie
class GameSimulation {
  private state: GameState;

  constructor(initialState: GameState) {
    this.state = { ...initialState };
  }

  applyMove(move: Move) {
    // Logique de simulation du mouvement
    switch (move.action_type) {
      case 'pass':
        this.handlePass(move);
        break;
      case 'shot':
        this.handleShot(move);
        break;
      case 'dribble':
        this.handleDribble(move);
        break;
    }
    
    this.state.turn++;
  }

  private handlePass(move: Move) {
    if (move.success) {
      this.state.ballPosition = move.to_position!;
    }
  }

  private handleShot(move: Move) {
    if (move.success && move.critical) {
      // But marqué
      const isTeamA = this.isTeamAPlayer(move.player_id);
      if (isTeamA) {
        this.state.scoreA++;
      } else {
        this.state.scoreB++;
      }
      
      // Réinitialiser la position du ballon
      this.state.ballPosition = 'Z2-2';
    }
  }

  private handleDribble(move: Move) {
    if (move.success) {
      this.state.ballPosition = move.to_position!;
    }
  }

  private isTeamAPlayer(playerId: string): boolean {
    // Logique pour déterminer l'équipe
    return true; // Simplification
  }

  getState(): GameState {
    return { ...this.state };
  }
}
```

## 5. Card Service

```typescript
// services/cards.ts
import { supabase } from './supabase';
import { PlayerCard, UserPlayer, BonusCard } from '@/types';

export class CardService {
  static async getAllCards() {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('rarity, position, name');

    if (error) throw error;
    return data;
  }

  static async getCardInventory() {
    const { data, error } = await supabase
      .from('card_inventory')
      .select(`
        *,
        card:players(*)
      `)
      .order('card.rarity, card.name');

    if (error) throw error;
    return data;
  }

  static async searchCards(query: string) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .or(`name.ilike.%${query}%,nationality.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data;
  }

  static async filterCards(filters: {
    position?: string;
    rarity?: string;
    minCost?: number;
    maxCost?: number;
  }) {
    let query = supabase.from('players').select('*');

    if (filters.position) {
      query = query.eq('position', filters.position);
    }
    if (filters.rarity) {
      query = query.eq('rarity', filters.rarity);
    }
    if (filters.minCost !== undefined) {
      query = query.gte('cp_cost', filters.minCost);
    }
    if (filters.maxCost !== undefined) {
      query = query.lte('cp_cost', filters.maxCost);
    }

    const { data, error } = await query.order('cp_cost, name');

    if (error) throw error;
    return data;
  }

  static async getBonusCards() {
    const { data, error } = await supabase
      .from('bonus_cards')
      .select('*')
      .eq('is_active', true)
      .order('card_number');

    if (error) throw error;
    return data;
  }

  static async calculateDeckStats(cardIds: string[]) {
    const { data: cards, error } = await supabase
      .from('players')
      .select('*')
      .in('id', cardIds);

    if (error) throw error;

    const stats = {
      totalCP: 0,
      positions: {} as Record<string, number>,
      rarities: {} as Record<string, number>,
      avgStats: {
        shot: 0,
        dribble: 0,
        pass: 0,
        block: 0,
      },
    };

    cards.forEach(card => {
      stats.totalCP += card.cp_cost;
      stats.positions[card.position] = (stats.positions[card.position] || 0) + 1;
      stats.rarities[card.rarity] = (stats.rarities[card.rarity] || 0) + 1;
      stats.avgStats.shot += card.shot;
      stats.avgStats.dribble += card.dribble;
      stats.avgStats.pass += card.pass;
      stats.avgStats.block += card.block;
    });

    // Calculer les moyennes
    const cardCount = cards.length;
    if (cardCount > 0) {
      stats.avgStats.shot /= cardCount;
      stats.avgStats.dribble /= cardCount;
      stats.avgStats.pass /= cardCount;
      stats.avgStats.block /= cardCount;
    }

    return stats;
  }
}
```

## 6. Admin Service

```typescript
// services/admin.ts
import { supabase } from './supabase';

export class AdminService {
  static async isAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role === 'admin';
  }

  static async getDashboardStats() {
    const { data, error } = await supabase.functions.invoke('admin-dashboard', {
      body: { action: 'getStats' }
    });

    if (error) throw error;
    return data;
  }

  static async getGamesAnalytics(timeframe: string) {
    const { data, error } = await supabase.functions.invoke('admin-analytics', {
      body: { 
        metric: 'games',
        timeframe 
      }
    });

    if (error) throw error;
    return data;
  }

  static async getUsersAnalytics(timeframe: string) {
    const { data, error } = await supabase.functions.invoke('admin-analytics', {
      body: { 
        metric: 'users',
        timeframe 
      }
    });

    if (error) throw error;
    return data;
  }

  static async getRevenueAnalytics(timeframe: string) {
    const { data, error } = await supabase.functions.invoke('admin-analytics', {
      body: { 
        metric: 'revenue',
        timeframe 
      }
    });

    if (error) throw error;
    return data;
  }

  static async moderateUser(userId: string, action: string, reason?: string) {
    const { data, error } = await supabase.functions.invoke('admin-moderate', {
      body: { 
        userId,
        action,
        reason 
      }
    });

    if (error) throw error;
    return data;
  }

  static async createCard(cardData: any) {
    const { data, error } = await supabase.functions.invoke('admin-manage-cards', {
      body: {
        action: 'create',
        cardData
      }
    });

    if (error) throw error;
    return data;
  }

  static async updateCard(cardId: string, updates: any) {
    const { data, error } = await supabase.functions.invoke('admin-manage-cards', {
      body: {
        action: 'update',
        cardId,
        cardData: updates
      }
    });

    if (error) throw error;
    return data;
  }

  static async adjustInventory(cardId: string, adjustment: number) {
    const { data, error } = await supabase.functions.invoke('admin-manage-cards', {
      body: {
        action: 'adjust_inventory',
        cardId,
        inventoryAdjustment: adjustment
      }
    });

    if (error) throw error;
    return data;
  }

  static async createPackType(packData: any) {
    const { data, error } = await supabase
      .from('pack_types')
      .insert(packData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async sendNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: any;
  }) {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        userId,
        notification
      }
    });

    if (error) throw error;
    return data;
  }

  static async broadcastNotification(notification: {
    title: string;
    body: string;
    data?: any;
    targetAudience?: string;
  }) {
    const { data, error } = await supabase.functions.invoke('broadcast-notification', {
      body: notification
    });

    if (error) throw error;
    return data;
  }
}
```

## 7. Payment Service

```typescript
// services/payment.ts
import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';
import { supabase } from './supabase';

export class PaymentService {
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;

    try {
      await InAppPurchases.connectAsync();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
    }
  }

  static async getProducts(productIds: string[]) {
    try {
      await this.initialize();
      const { results } = await InAppPurchases.getProductsAsync(productIds);
      return results;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  static async purchaseProduct(productId: string, userId: string) {
    try {
      await this.initialize();
      
      // Acheter le produit
      const { results } = await InAppPurchases.purchaseItemAsync(productId);
      
      if (results.length > 0) {
        const purchase = results[0];
        
        // Vérifier l'achat côté serveur
        const { data, error } = await supabase.functions.invoke('verify-purchase', {
          body: {
            platform: Platform.OS,
            productId,
            purchaseToken: purchase.purchaseToken,
            userId
          }
        });

        if (error) throw error;

        // Finaliser l'achat
        await InAppPurchases.finishTransactionAsync(purchase, true);
        
        return data;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  static async restorePurchases(userId: string) {
    try {
      await this.initialize();
      
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      
      // Vérifier chaque achat avec le serveur
      for (const purchase of results) {
        await supabase.functions.invoke('restore-purchase', {
          body: {
            platform: Platform.OS,
            productId: purchase.productId,
            purchaseToken: purchase.purchaseToken,
            userId
          }
        });
      }

      return results;
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  static async processWebPayment(packTypeId: string, paymentMethodId: string) {
    try {
      // Pour les paiements web (Stripe)
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          packTypeId,
          paymentMethodId
        }
      });

      if (error) throw error;

      // Confirmer le paiement
      if (data.requiresConfirmation) {
        const { data: confirmation, error: confirmError } = await supabase.functions.invoke('confirm-payment', {
          body: {
            paymentIntentId: data.paymentIntentId
          }
        });

        if (confirmError) throw confirmError;
        return confirmation;
      }

      return data;
    } catch (error) {
      console.error('Web payment failed:', error);
      throw error;
    }
  }
}
```

## 8. Cache Service

```typescript
// services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  static async get<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      
      // Vérifier si le cache est expiré
      if (Date.now() > item.timestamp + item.ttl) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL) {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  static async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Helper pour créer des clés de cache cohérentes
  static createKey(namespace: string, ...params: any[]): string {
    return `${namespace}:${params.join(':')}`;
  }
}

// Décorateur pour mettre en cache automatiquement
export function Cacheable(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = CacheService.createKey(
        `${target.constructor.name}:${propertyName}`,
        ...args
      );

      // Essayer de récupérer depuis le cache
      const cached = await CacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Sinon, exécuter la méthode et mettre en cache
      const result = await originalMethod.apply(this, args);
      await CacheService.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}
```

## 9. Error Service

```typescript
// services/error.ts
import * as Sentry from '@sentry/react-native';

export class ErrorService {
  static initialize() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      });
    }
  }

  static captureException(error: Error, context?: any) {
    console.error('Error captured:', error, context);
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console.log(`[${level.toUpperCase()}]`, message);
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, level);
    }
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }
  }

  static clearUser() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(null);
    }
  }

  static handleApiError(error: any): string {
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          return message || 'Requête invalide';
        case 401:
          return 'Non autorisé';
        case 403:
          return 'Accès refusé';
        case 404:
          return 'Ressource introuvable';
        case 429:
          return 'Trop de requêtes, veuillez réessayer plus tard';
        case 500:
          return 'Erreur serveur';
        default:
          return message || 'Une erreur est survenue';
      }
    } else if (error.request) {
      // Pas de réponse reçue
      return 'Erreur de connexion';
    } else {
      // Erreur de configuration
      return error.message || 'Une erreur est survenue';
    }
  }
}
```

## 10. Analytics Service

```typescript
// services/analytics.ts
import * as Analytics from 'expo-firebase-analytics';
import { supabase } from './supabase';

export class AnalyticsService {
  static async initialize() {
    // Initialiser Firebase Analytics si nécessaire
  }

  static async trackEvent(eventName: string, parameters?: any) {
    try {
      // Firebase Analytics
      await Analytics.logEvent(eventName, parameters);

      // Envoyer aussi à notre backend pour des analytics custom
      await supabase.functions.invoke('track-event', {
        body: {
          eventName,
          parameters,
          timestamp: Date.now(),
          platform: Platform.OS,
        }
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  static async setUserProperties(properties: Record<string, any>) {
    try {
      for (const [key, value] of Object.entries(properties)) {
        await Analytics.setUserProperty(key, String(value));
      }
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  static async trackScreen(screenName: string, screenClass?: string) {
    try {
      await Analytics.logScreenView({
        screen_name: screenName,
        screen_class: screenClass,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Événements spécifiques au jeu
  static async trackGameStart(gameMode: string, deckId?: string) {
    await this.trackEvent('game_start', {
      game_mode: gameMode,
      has_custom_deck: !!deckId,
    });
  }

  static async trackGameEnd(gameId: string, result: string, duration: number) {
    await this.trackEvent('game_end', {
      game_id: gameId,
      result,
      duration_seconds: duration,
    });
  }

  static async trackPurchase(productId: string, price: number, currency: string) {
    await this.trackEvent('purchase', {
      product_id: productId,
      price,
      currency,
    });
  }

  static async trackCardUnlock(cardId: string, rarity: string, source: string) {
    await this.trackEvent('card_unlock', {
      card_id: cardId,
      rarity,
      source, // 'pack', 'reward', etc.
    });
  }
}
```