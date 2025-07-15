-- Table de l'historique des matchs
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

-- Vue pour les analytics de jeu
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

-- Index pour performance
CREATE INDEX idx_match_history_game ON match_history(game_id);
CREATE INDEX idx_match_history_players ON match_history(player_a, player_b);