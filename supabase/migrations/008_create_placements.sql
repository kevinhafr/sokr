-- Table des placements
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
CREATE INDEX idx_placements_player ON placements(game_id, player_id);