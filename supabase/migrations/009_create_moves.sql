-- Table des mouvements/actions
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

-- Index pour performance
CREATE INDEX idx_moves_game_turn ON moves(game_id, turn_number);
CREATE INDEX idx_moves_validation ON moves(server_validated) WHERE server_validated = false;
CREATE INDEX idx_moves_game_recent ON moves(game_id, created_at DESC);