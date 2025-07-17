-- Table des cartes joueurs
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
CREATE INDEX idx_players_active ON players(is_active) WHERE is_active = true;

-- Permissions
GRANT SELECT ON players TO authenticated;
GRANT UPDATE ON players TO authenticated;