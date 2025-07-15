# Rocket Footy - Base de Données & Schéma

## Types personnalisés

```sql
-- Énumérations
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE game_status AS ENUM (
  'initializing',
  'waitingForPlayers', 
  'coinToss',
  'placement',
  'placementTeamA',
  'placementTeamB',
  'placementLocked',
  'active',
  'activeTurnA',
  'activeTurnB',
  'halfTime',
  'completed'
);

CREATE TYPE card_rarity AS ENUM ('Common', 'Limited', 'Rare', 'SuperRare', 'Unique');
CREATE TYPE player_position AS ENUM ('gardien', 'defenseur', 'milieu', 'attaquant');
CREATE TYPE board_position AS ENUM (
  'G1', 
  'Z1-1', 'Z1-2', 'Z1-3',
  'Z2-1', 'Z2-2', 'Z2-3',
  'Z3-1', 'Z3-2', 'Z3-3',
  'G2'
);
CREATE TYPE action_type AS ENUM ('pass', 'shot', 'dribble', 'substitute', 'play_bonus');
CREATE TYPE game_result AS ENUM ('win', 'loss', 'draw', 'abandon');
```

## Tables principales

### 1. Profils utilisateurs

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Informations de base
  role user_role DEFAULT 'user',
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  
  -- Statistiques
  mmr INT DEFAULT 1000,
  total_games INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  
  -- Système de sanctions
  ban_until TIMESTAMPTZ,
  consecutive_abandons INT DEFAULT 0,
  last_abandon_at TIMESTAMPTZ,
  ban_count INT DEFAULT 0, -- Three-strikes system
  
  -- Préférences
  settings JSONB DEFAULT '{"sound": true, "vibration": true}'
);

-- Index pour performance
CREATE INDEX idx_profiles_mmr ON profiles(mmr);
CREATE INDEX idx_profiles_role ON profiles(role) WHERE role = 'admin';
```

### 2. Cartes joueurs

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Informations de base
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  position player_position NOT NULL,
  rarity card_rarity NOT NULL,
  
  -- Statistiques
  shot INT4 NOT NULL CHECK (shot >= 0 AND shot <= 5),
  dribble INT4 NOT NULL CHECK (dribble >= 0 AND dribble <= 5),
  pass INT4 NOT NULL CHECK (pass >= 0 AND pass <= 5),
  block INT4 NOT NULL CHECK (block >= 0 AND block <= 5),
  
  -- Mécaniques
  cp_cost INT4 NOT NULL CHECK (cp_cost >= 3 AND cp_cost <= 8),
  special_ability TEXT,
  reroll_count INT DEFAULT 0, -- For SuperRare: 1, Unique: 1
  
  -- Assets
  image_url TEXT,
  
  -- Métadonnées
  is_active BOOLEAN DEFAULT true,
  edition TEXT DEFAULT 'base' -- Pour futures extensions
);

-- Contraintes de rareté sur les stats
ALTER TABLE players ADD CONSTRAINT check_stat_limits CHECK (
  (rarity = 'Common' AND shot <= 3 AND dribble <= 3 AND pass <= 3 AND block <= 3) OR
  (rarity = 'Limited' AND shot <= 3 AND dribble <= 3 AND pass <= 3 AND block <= 3) OR
  (rarity = 'Rare' AND shot <= 4 AND dribble <= 4 AND pass <= 4 AND block <= 4) OR
  (rarity = 'SuperRare' AND shot <= 5 AND dribble <= 5 AND pass <= 5 AND block <= 5) OR
  (rarity = 'Unique' AND shot <= 5 AND dribble <= 5 AND pass <= 5 AND block <= 5)
);

-- Index pour performance
CREATE INDEX idx_players_rarity ON players(rarity);
CREATE INDEX idx_players_position ON players(position);
```

### 3. Inventaire des cartes

```sql
CREATE TABLE card_inventory (
  player_id UUID REFERENCES players(id) PRIMARY KEY,
  total_copies INT NOT NULL,
  available_copies INT NOT NULL,
  reserved_copies INT DEFAULT 0, -- Pour les parties en cours
  
  CONSTRAINT check_copies CHECK (
    available_copies >= 0 AND 
    available_copies + reserved_copies <= total_copies
  )
);

-- Trigger pour vérifier les limites de rareté
CREATE OR REPLACE FUNCTION check_rarity_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_copies > 
    CASE (SELECT rarity FROM players WHERE id = NEW.player_id)
      WHEN 'Common' THEN 10000
      WHEN 'Limited' THEN 1000
      WHEN 'Rare' THEN 100
      WHEN 'SuperRare' THEN 10
      WHEN 'Unique' THEN 1
    END
  THEN
    RAISE EXCEPTION 'Dépassement de la limite de copies pour cette rareté';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_rarity_limits
BEFORE INSERT OR UPDATE ON card_inventory
FOR EACH ROW EXECUTE FUNCTION check_rarity_limits();
```

### 4. Liaison utilisateur-cartes

```sql
CREATE TABLE user_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  player_id UUID REFERENCES players(id),
  
  -- Progression
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  xp INT DEFAULT 0,
  total_xp INT DEFAULT 0, -- XP cumulé (historique)
  
  -- Améliorations
  stat_upgrades JSONB DEFAULT '{}', -- {"shot": 1, "pass": 2}
  
  -- Métadonnées
  obtained_at TIMESTAMPTZ DEFAULT NOW(),
  games_played INT DEFAULT 0,
  goals_scored INT DEFAULT 0,
  assists_made INT DEFAULT 0,
  duels_won INT DEFAULT 0,
  
  UNIQUE(user_id, player_id)
);

-- Trigger pour vérifier les limites de niveau par rareté
CREATE OR REPLACE FUNCTION check_level_limits()
RETURNS TRIGGER AS $$
DECLARE
  player_rarity card_rarity;
  max_level INT;
BEGIN
  SELECT rarity INTO player_rarity FROM players WHERE id = NEW.player_id;
  
  max_level := CASE player_rarity
    WHEN 'Common', 'Limited' THEN 3
    WHEN 'Rare' THEN 4
    WHEN 'SuperRare', 'Unique' THEN 5
  END;
  
  IF NEW.level > max_level THEN
    RAISE EXCEPTION 'Niveau maximum dépassé pour cette rareté';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_level_limits
BEFORE INSERT OR UPDATE ON user_players
FOR EACH ROW EXECUTE FUNCTION check_level_limits();
```

### 5. Cartes bonus

```sql
CREATE TABLE bonus_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT CHECK (type IN ('Play', 'Condition')),
  effect TEXT NOT NULL,
  duration INT DEFAULT 0, -- 0 pour Play, 1-2 pour Condition
  timing TEXT CHECK (timing IN ('immediate', 'turn_start', 'reaction')),
  
  -- Métadonnées
  set_name TEXT DEFAULT 'base',
  card_number INT,
  is_active BOOLEAN DEFAULT true
);

-- Cartes bonus initiales
INSERT INTO bonus_cards (name, emoji, type, effect, duration, timing, card_number) VALUES
('Double Action', '🔄', 'Play', 'Un joueur agit deux fois', 0, 'immediate', 1),
('Carton Rouge', '🚫', 'Play', 'Exclut 1 joueur adverse 1 tour', 0, 'immediate', 2),
('Relance de Dé', '🎲', 'Play', 'Relance 1 dé que tu viens de lancer', 0, 'immediate', 3),
('Changement Express', '🔁', 'Play', 'Fait entrer un remplaçant qui peut agir', 0, 'immediate', 4),
('Mur Défensif', '🛡', 'Condition', 'Annule la 1ʳᵉ action offensive adverse chaque tour', 2, 'turn_start', 5),
('Précision Parfaite', '🎯', 'Play', 'Ta prochaine Passe/Tir compte comme 6', 0, 'immediate', 6),
('Rush Offensif', '➡️', 'Play', 'Avance la balle d''une zone (pas d''action)', 0, 'immediate', 7),
('1 vs 1 Maîtrisé', '⚔️', 'Play', 'Gagne automatiquement un duel', 0, 'immediate', 8),
('Tir Surprise', '💥', 'Play', 'Autorise un Tir depuis Z1 ou Z2', 0, 'immediate', 9),
('Tir Double', '🎯', 'Play', 'Prochain Tir : lance 2 D6, garde le meilleur', 0, 'immediate', 10),
('Temps Gelé', '🕰', 'Condition', 'L''adversaire ne peut pas jouer de cartes', 1, 'turn_start', 11);
```

### 6. Parties

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- État du jeu
  status game_status NOT NULL DEFAULT 'initializing',
  current_turn INT DEFAULT 0,
  turn_started_at TIMESTAMPTZ,
  
  -- Joueurs
  player_a UUID REFERENCES profiles(id),
  player_b UUID REFERENCES profiles(id),
  current_player UUID, -- Joueur actif
  
  -- Score et résultat
  score_a INT DEFAULT 0,
  score_b INT DEFAULT 0,
  winner UUID REFERENCES profiles(id),
  result_a game_result,
  result_b game_result,
  
  -- Mécaniques
  coin_toss_winner UUID,
  first_placement_player UUID,
  halftime_first_player UUID,
  
  -- État du jeu
  game_state JSONB DEFAULT '{}', -- État complet pour reconnexion
  board_state JSONB DEFAULT '{}', -- Positions des joueurs
  ball_position board_position DEFAULT 'Z2-2',
  
  -- Métadonnées
  mode TEXT CHECK (mode IN ('quick', 'draft', 'friendly')),
  mmr_change JSONB, -- {"player_a": +15, "player_b": -15}
  completed_at TIMESTAMPTZ,
  
  -- Contraintes
  CHECK (player_a != player_b),
  CHECK (score_a >= 0 AND score_b >= 0)
);

-- Index pour performance
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_players ON games(player_a, player_b);
CREATE INDEX idx_games_active ON games(status) WHERE status NOT IN ('completed', 'abandoned');
```

### 7. Placements

```sql
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES profiles(id),
  card_id UUID REFERENCES players(id),
  position board_position NOT NULL,
  placement_order INT NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  is_substitute BOOLEAN DEFAULT false,
  
  -- État
  is_expelled BOOLEAN DEFAULT false,
  expelled_until_turn INT,
  
  UNIQUE(game_id, position),
  UNIQUE(game_id, placement_order)
);

-- Index pour performance
CREATE INDEX idx_placements_game ON placements(game_id);
```

### 8. Actions/Mouvements

```sql
CREATE TABLE moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  turn_number INT NOT NULL,
  player_id UUID REFERENCES profiles(id),
  
  -- Action
  action_type action_type NOT NULL,
  actor_card_id UUID REFERENCES players(id),
  target_card_id UUID REFERENCES players(id),
  from_position board_position,
  to_position board_position,
  
  -- Résolution
  initial_roll INT CHECK (initial_roll >= 1 AND initial_roll <= 6),
  attacker_roll INT,
  defender_roll INT,
  attacker_total INT, -- Avec tous les bonus
  defender_total INT,
  
  -- Modificateurs
  modifiers JSONB DEFAULT '{}', -- {"formation": 1, "rarity": 1, "bonus_card": 2}
  bonus_cards_used JSONB DEFAULT '[]', -- IDs des cartes bonus utilisées
  reroll_used BOOLEAN DEFAULT false,
  special_ability_used BOOLEAN DEFAULT false,
  
  -- Résultat
  success BOOLEAN,
  critical BOOLEAN DEFAULT false,
  result_description TEXT,
  xp_gained JSONB DEFAULT '{}', -- {"actor": 15, "target": 5}
  
  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INT, -- Temps de décision
  
  -- Validation anti-triche
  hash TEXT NOT NULL, -- Hash de l'action pour intégrité
  server_validated BOOLEAN DEFAULT false
);

-- Index pour performance et intégrité
CREATE INDEX idx_moves_game_turn ON moves(game_id, turn_number);
CREATE INDEX idx_moves_validation ON moves(server_validated) WHERE server_validated = false;
```

### 9. Decks sauvegardés

```sql
CREATE TABLE saved_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  cards JSONB NOT NULL, -- Array des player_ids
  bonus_cards JSONB, -- Array des bonus_card_ids
  total_cp INT NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- Limite de 5 decks favoris par joueur
CREATE OR REPLACE FUNCTION check_favorite_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_favorite AND (
    SELECT COUNT(*) FROM saved_decks 
    WHERE user_id = NEW.user_id AND is_favorite = true AND id != NEW.id
  ) >= 5 THEN
    RAISE EXCEPTION 'Limite de 5 decks favoris atteinte';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 10. Système de boutique et packs

```sql
CREATE TABLE pack_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  card_count INT NOT NULL,
  
  -- Probabilités de base
  probabilities JSONB NOT NULL, 
  -- {"Common": 0.7, "Limited": 0.2, "Rare": 0.08, "SuperRare": 0.019, "Unique": 0.001}
  
  -- Garanties
  guarantees JSONB DEFAULT '{}',
  -- {"min_rare": 1, "min_limited": 2}
  
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  pack_type_id UUID REFERENCES pack_types(id),
  
  -- Transaction
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  transaction_id TEXT UNIQUE,
  
  -- Résultat
  cards_received JSONB NOT NULL, -- Array des player_ids obtenus
  opened_at TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  platform TEXT, -- 'ios', 'android'
  
  -- Bonus gros acheteurs
  bonus_applied JSONB DEFAULT '{}'
);

-- Table pour tracker les dépenses (bonus gros acheteurs)
CREATE TABLE spending_tracker (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  total_spent DECIMAL(10,2) DEFAULT 0,
  packs_opened INT DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0
);
```

### 11. Historique et analytics

```sql
CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  
  -- Snapshot complet pour replay
  full_history JSONB NOT NULL, -- Tous les moves, états, etc.
  
  -- Métadonnées pour recherche
  player_a UUID REFERENCES profiles(id),
  player_b UUID REFERENCES profiles(id),
  winner UUID REFERENCES profiles(id),
  duration_seconds INT,
  total_moves INT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vue pour les statistiques admin
CREATE VIEW game_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as games_played,
  COUNT(DISTINCT player_a) + COUNT(DISTINCT player_b) as unique_players,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_duration_seconds,
  SUM(CASE WHEN result_a = 'abandon' OR result_b = 'abandon' THEN 1 ELSE 0 END) as abandons
FROM games
WHERE status = 'completed'
GROUP BY DATE(created_at);
```

## Politiques RLS (Row Level Security)

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;
-- ... (activer pour toutes les tables)

-- Politiques pour les profils
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les cartes des joueurs
CREATE POLICY "Users can view own cards" ON user_players
  FOR SELECT USING (auth.uid() = user_id);

-- Politiques pour les parties
CREATE POLICY "Players can view their games" ON games
  FOR SELECT USING (
    auth.uid() = player_a OR 
    auth.uid() = player_b
  );

CREATE POLICY "Active players can update game" ON games
  FOR UPDATE USING (
    auth.uid() IN (player_a, player_b) AND
    status NOT IN ('completed', 'abandoned')
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

-- Politiques admin
CREATE POLICY "Admins can view all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Fonctions utilitaires

```sql
-- Fonction pour calculer le nouveau MMR
CREATE OR REPLACE FUNCTION calculate_mmr_change(
  winner_mmr INT,
  loser_mmr INT,
  is_draw BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  k_factor INT := 32;
  expected_winner DECIMAL;
  expected_loser DECIMAL;
  change_winner INT;
  change_loser INT;
BEGIN
  expected_winner := 1.0 / (1.0 + POWER(10, (loser_mmr - winner_mmr) / 400.0));
  expected_loser := 1.0 - expected_winner;
  
  IF is_draw THEN
    change_winner := ROUND(k_factor * (0.5 - expected_winner));
    change_loser := ROUND(k_factor * (0.5 - expected_loser));
  ELSE
    change_winner := ROUND(k_factor * (1 - expected_winner));
    change_loser := ROUND(k_factor * (0 - expected_loser));
  END IF;
  
  RETURN jsonb_build_object(
    'winner_change', change_winner,
    'loser_change', change_loser
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour distribuer le deck initial
CREATE OR REPLACE FUNCTION assign_starter_deck(p_user_id UUID) 
RETURNS void AS $$
DECLARE
  v_card RECORD;
  v_position player_position;
  v_count INT;
BEGIN
  -- Distribuer 2 gardiens
  FOR v_card IN (
    SELECT id FROM players 
    WHERE position = 'gardien' 
    AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 2
  ) LOOP
    INSERT INTO user_players (user_id, player_id) 
    VALUES (p_user_id, v_card.id);
    
    UPDATE card_inventory 
    SET available_copies = available_copies - 1
    WHERE player_id = v_card.id;
  END LOOP;
  
  -- Distribuer 2-3 de chaque position
  FOR v_position IN SELECT unnest(ARRAY['defenseur', 'milieu', 'attaquant']::player_position[]) LOOP
    v_count := 2 + FLOOR(RANDOM() * 2); -- 2 ou 3
    
    FOR v_card IN (
      SELECT id FROM players 
      WHERE position = v_position 
      AND rarity = 'Common'
      ORDER BY RANDOM()
      LIMIT v_count
    ) LOOP
      INSERT INTO user_players (user_id, player_id) 
      VALUES (p_user_id, v_card.id);
      
      UPDATE card_inventory 
      SET available_copies = available_copies - 1
      WHERE player_id = v_card.id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Triggers de synchronisation

```sql
-- Trigger pour notifier les changements via Realtime
CREATE OR REPLACE FUNCTION notify_game_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'game_updates',
    json_build_object(
      'game_id', NEW.id,
      'status', NEW.status,
      'current_player', NEW.current_player,
      'score_a', NEW.score_a,
      'score_b', NEW.score_b
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_game_updates
AFTER UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION notify_game_change();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Indexes pour performance

```sql
-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_games_active_players ON games(player_a, player_b) 
  WHERE status NOT IN ('completed', 'abandoned');

CREATE INDEX idx_moves_game_recent ON moves(game_id, created_at DESC);

CREATE INDEX idx_user_players_level ON user_players(user_id, level);

-- Index pour le matchmaking
CREATE INDEX idx_profiles_matchmaking ON profiles(mmr, ban_until) 
  WHERE ban_until IS NULL OR ban_until < NOW();
```

## Contraintes métier supplémentaires

```sql
-- Contrainte sur le CP total d'une équipe
CREATE OR REPLACE FUNCTION check_team_cp_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_cp INT;
BEGIN
  SELECT SUM(p.cp_cost) INTO total_cp
  FROM placements pl
  JOIN players p ON pl.card_id = p.id
  WHERE pl.game_id = NEW.game_id
  AND pl.player_id = NEW.player_id
  AND NOT pl.is_substitute;
  
  IF total_cp > 20 THEN
    RAISE EXCEPTION 'Limite CP de l''équipe dépassée (max 20)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Contrainte sur le nombre maximum de cartes par zone
CREATE OR REPLACE FUNCTION check_zone_limit()
RETURNS TRIGGER AS $$
DECLARE
  zone_count INT;
BEGIN
  -- Extraire la zone de la position (Z1, Z2, Z3)
  SELECT COUNT(*) INTO zone_count
  FROM placements
  WHERE game_id = NEW.game_id
  AND position LIKE SUBSTRING(NEW.position FROM 1 FOR 2) || '%'
  AND id != NEW.id;
  
  IF zone_count >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 cartes par zone';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```