-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
-- card_inventory supprimé
ALTER TABLE user_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create their profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users cannot delete profiles" ON profiles
  FOR DELETE USING (false);

-- Politiques pour les joueurs (cartes)
CREATE POLICY "Players cards are public" ON players
  FOR SELECT USING (true);

-- Politiques pour l'inventaire supprimées (card_inventory n'existe plus)

-- Politiques pour les cartes des utilisateurs
CREATE POLICY "Users can view own cards" ON user_players
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view opponent cards in game" ON user_players
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE (player_a = auth.uid() OR player_b = auth.uid())
      AND status NOT IN ('completed', 'abandoned')
      AND (player_a = user_players.user_id OR player_b = user_players.user_id)
    )
  );

-- Politiques pour les cartes bonus
CREATE POLICY "Bonus cards are public" ON bonus_cards
  FOR SELECT USING (true);

-- Politiques pour les parties
CREATE POLICY "Players can view their games" ON games
  FOR SELECT USING (
    auth.uid() = player_a OR 
    auth.uid() = player_b
  );

CREATE POLICY "Players can create games" ON games
  FOR INSERT WITH CHECK (
    auth.uid() = player_a OR 
    auth.uid() = player_b
  );

CREATE POLICY "Active players can update game" ON games
  FOR UPDATE USING (
    auth.uid() IN (player_a, player_b) AND
    status NOT IN ('completed', 'abandoned')
  );

-- Politiques pour les placements
CREATE POLICY "Players can view placements in their games" ON placements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = placements.game_id 
      AND (games.player_a = auth.uid() OR games.player_b = auth.uid())
    )
  );

CREATE POLICY "Players can insert own placements" ON placements
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_id 
      AND (games.player_a = auth.uid() OR games.player_b = auth.uid())
      AND status IN ('placement', 'placementTeamA', 'placementTeamB')
    )
  );

-- Politiques pour les moves
CREATE POLICY "Players can view moves in their games" ON moves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = moves.game_id 
      AND (games.player_a = auth.uid() OR games.player_b = auth.uid())
    )
  );

CREATE POLICY "Players can insert own moves" ON moves
  FOR INSERT WITH CHECK (
    auth.uid() = player_id AND
    EXISTS (
      SELECT 1 FROM games 
      WHERE games.id = game_id 
      AND games.current_player = auth.uid()
      AND status IN ('active', 'activeTurnA', 'activeTurnB')
    )
  );

-- Politiques pour les decks
CREATE POLICY "Users can view own decks" ON saved_decks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON saved_decks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON saved_decks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON saved_decks
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour les types de packs
CREATE POLICY "Pack types are public" ON pack_types
  FOR SELECT USING (is_active = true);

-- Politiques pour les achats
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour le suivi des dépenses
CREATE POLICY "Users can view own spending" ON spending_tracker
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour l'historique des matchs
CREATE POLICY "Players can view their match history" ON match_history
  FOR SELECT USING (
    auth.uid() = player_a OR 
    auth.uid() = player_b
  );


CREATE POLICY "Admins can manage all games" ON games
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all moves" ON moves
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage pack types" ON pack_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON saved_decks TO authenticated;