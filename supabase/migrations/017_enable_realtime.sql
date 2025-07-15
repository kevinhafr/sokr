-- Activer le realtime pour les tables nécessaires

-- Table games : pour la synchronisation en temps réel des parties
ALTER TABLE games REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Table moves : pour voir les actions en temps réel
ALTER TABLE moves REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE moves;

-- Table placements : pour voir les placements de cartes en temps réel
ALTER TABLE placements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE placements;

-- Table profiles : pour voir les changements de statut des joueurs
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Table match_history : pour les mises à jour d'historique
ALTER TABLE match_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE match_history;