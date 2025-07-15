-- Table des decks sauvegardés
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

-- Fonction pour vérifier la limite de decks favoris
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

-- Trigger pour vérifier la limite
CREATE TRIGGER trigger_check_favorite_limit
BEFORE INSERT OR UPDATE ON saved_decks
FOR EACH ROW EXECUTE FUNCTION check_favorite_limit();

-- Index pour performance
CREATE INDEX idx_saved_decks_user ON saved_decks(user_id);
CREATE INDEX idx_saved_decks_favorite ON saved_decks(user_id, is_favorite) WHERE is_favorite = true;