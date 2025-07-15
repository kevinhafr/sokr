-- Indexes composites pour les requêtes fréquentes

-- Index pour la recherche de joueurs par nom
CREATE INDEX idx_players_name ON players(name);

-- Index pour les cartes actives par position et rareté
CREATE INDEX idx_players_position_rarity ON players(position, rarity) WHERE is_active = true;

-- Index pour les parties actives par joueur
CREATE INDEX idx_games_player_a_active ON games(player_a) WHERE status NOT IN ('completed', 'abandoned');
CREATE INDEX idx_games_player_b_active ON games(player_b) WHERE status NOT IN ('completed', 'abandoned');

-- Index pour le matchmaking basé sur le MMR
CREATE INDEX idx_profiles_mmr_range ON profiles(mmr, ban_until);

-- Index pour les cartes d'utilisateur par niveau
CREATE INDEX idx_user_players_user_level ON user_players(user_id, level);

-- Index pour les statistiques de cartes
CREATE INDEX idx_user_players_stats ON user_players(goals_scored, assists_made, duels_won);

-- Index pour la recherche de decks
CREATE INDEX idx_saved_decks_valid ON saved_decks(user_id, is_valid) WHERE is_valid = true;

-- Index pour les achats récents
CREATE INDEX idx_purchases_recent ON purchases(user_id, created_at);

-- Index card_inventory supprimé - on utilise players.available_editions

-- Index pour les moves récents par partie
CREATE INDEX idx_moves_recent ON moves(game_id, created_at);

-- Index pour les placements actifs
CREATE INDEX idx_placements_active ON placements(game_id, is_expelled) WHERE is_expelled = false;

-- Index pour les analytics temporelles (utilise created_at directement)
CREATE INDEX idx_games_created_at ON games(created_at);
CREATE INDEX idx_purchases_created_at ON purchases(created_at);

-- Index pour la recherche de parties par statut et mode
CREATE INDEX idx_games_status_mode ON games(status, mode);

-- Index pour l'historique des matchs par durée
CREATE INDEX idx_match_history_duration ON match_history(duration_seconds);

-- Index de performance pour les jointures fréquentes
CREATE INDEX idx_placements_card_player ON placements(card_id, player_id);
CREATE INDEX idx_moves_actor_target ON moves(actor_card_id, target_card_id);