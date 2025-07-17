-- Table de liaison utilisateur-cartes
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

-- Fonction pour vérifier les limites de niveau selon la rareté
CREATE OR REPLACE FUNCTION check_level_limits()
RETURNS TRIGGER AS $$
DECLARE
  player_rarity card_rarity;
  max_level INT;
BEGIN
  SELECT rarity INTO player_rarity FROM players WHERE id = NEW.player_id;
  
  max_level := CASE 
    WHEN player_rarity IN ('Common', 'Limited') THEN 3
    WHEN player_rarity = 'Rare' THEN 4
    WHEN player_rarity IN ('SuperRare', 'Unique') THEN 5
    ELSE 3
  END;
  
  IF NEW.level > max_level THEN
    RAISE EXCEPTION 'Niveau maximum dépassé pour cette rareté';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier les limites de niveau
CREATE TRIGGER trigger_check_level_limits
BEFORE INSERT OR UPDATE ON user_players
FOR EACH ROW EXECUTE FUNCTION check_level_limits();

-- Index pour performance
CREATE INDEX idx_user_players_user ON user_players(user_id);
CREATE INDEX idx_user_players_level ON user_players(user_id, level);

-- Permissions
GRANT SELECT ON user_players TO authenticated;
GRANT INSERT ON user_players TO authenticated;
GRANT UPDATE ON user_players TO authenticated;