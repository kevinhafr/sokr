-- Table des parties
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
CREATE INDEX idx_games_active_players ON games(player_a, player_b) 
  WHERE status NOT IN ('completed', 'abandoned');

-- Permissions
GRANT SELECT ON games TO authenticated;
GRANT INSERT ON games TO authenticated;
GRANT UPDATE ON games TO authenticated;