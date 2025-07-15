import { 
  User, 
  Profile, 
  PlayerCard, 
  UserPlayer, 
  BonusCard, 
  Game, 
  Placement, 
  Move, 
  SavedDeck, 
  PackType, 
  Purchase 
} from './models';

// Ce fichier sera généré automatiquement par Supabase CLI
// Pour l'instant, on crée une interface Database de base
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id?: string };
        Update: Partial<Profile>;
      };
      players: {
        Row: PlayerCard;
        Insert: Partial<PlayerCard> & { id?: string };
        Update: Partial<PlayerCard>;
      };
      user_players: {
        Row: UserPlayer;
        Insert: Partial<UserPlayer> & { id?: string };
        Update: Partial<UserPlayer>;
      };
      bonus_cards: {
        Row: BonusCard;
        Insert: Partial<BonusCard> & { id?: string };
        Update: Partial<BonusCard>;
      };
      games: {
        Row: Game;
        Insert: Partial<Game> & { id?: string };
        Update: Partial<Game>;
      };
      placements: {
        Row: Placement;
        Insert: Partial<Placement> & { id?: string };
        Update: Partial<Placement>;
      };
      moves: {
        Row: Move;
        Insert: Partial<Move> & { id?: string };
        Update: Partial<Move>;
      };
      saved_decks: {
        Row: SavedDeck;
        Insert: Partial<SavedDeck> & { id?: string };
        Update: Partial<SavedDeck>;
      };
      pack_types: {
        Row: PackType;
        Insert: Partial<PackType> & { id?: string };
        Update: Partial<PackType>;
      };
      purchases: {
        Row: Purchase;
        Insert: Partial<Purchase> & { id?: string };
        Update: Partial<Purchase>;
      };
      card_inventory: {
        Row: {
          player_id: string;
          total_copies: number;
          available_copies: number;
          reserved_copies: number;
        };
        Insert: {
          player_id: string;
          total_copies: number;
          available_copies: number;
          reserved_copies?: number;
        };
        Update: {
          total_copies?: number;
          available_copies?: number;
          reserved_copies?: number;
        };
      };
      spending_tracker: {
        Row: {
          user_id: string;
          total_spent: number;
          packs_opened: number;
          last_purchase_at: string | null;
          tier: string;
          bonus_multiplier: number;
        };
        Insert: {
          user_id: string;
          total_spent?: number;
          packs_opened?: number;
          last_purchase_at?: string | null;
          tier?: string;
          bonus_multiplier?: number;
        };
        Update: {
          total_spent?: number;
          packs_opened?: number;
          last_purchase_at?: string | null;
          tier?: string;
          bonus_multiplier?: number;
        };
      };
      match_history: {
        Row: {
          id: string;
          game_id: string;
          full_history: any;
          player_a: string;
          player_b: string;
          winner: string | null;
          duration_seconds: number;
          total_moves: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          full_history: any;
          player_a: string;
          player_b: string;
          winner?: string | null;
          duration_seconds: number;
          total_moves: number;
          created_at?: string;
        };
        Update: {
          full_history?: any;
          winner?: string | null;
          duration_seconds?: number;
          total_moves?: number;
        };
      };
    };
    Views: {
      game_analytics: {
        Row: {
          date: string;
          games_played: number;
          unique_players: number;
          avg_duration_seconds: number;
          abandons: number;
        };
      };
    };
    Functions: {
      calculate_mmr_change: {
        Args: {
          winner_mmr: number;
          loser_mmr: number;
          is_draw?: boolean;
        };
        Returns: {
          winner_change: number;
          loser_change: number;
        };
      };
      assign_starter_deck: {
        Args: {
          p_user_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      user_role: 'user' | 'admin';
      game_status: 'initializing' | 'waitingForPlayers' | 'coinToss' | 'placement' | 'placementTeamA' | 'placementTeamB' | 'placementLocked' | 'active' | 'activeTurnA' | 'activeTurnB' | 'halfTime' | 'completed';
      card_rarity: 'Common' | 'Limited' | 'Rare' | 'SuperRare' | 'Unique';
      player_position: 'gardien' | 'defenseur' | 'milieu' | 'attaquant';
      board_position: 'G1' | 'Z1-1' | 'Z1-2' | 'Z1-3' | 'Z2-1' | 'Z2-2' | 'Z2-3' | 'Z3-1' | 'Z3-2' | 'Z3-3' | 'G2';
      action_type: 'pass' | 'shot' | 'dribble' | 'substitute' | 'play_bonus';
      game_result: 'win' | 'loss' | 'draw' | 'abandon';
    };
  };
}