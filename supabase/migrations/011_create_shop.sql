-- Table des types de packs
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

-- Table des achats
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

-- Table de suivi des dépenses
CREATE TABLE spending_tracker (
  user_id UUID REFERENCES profiles(id) PRIMARY KEY,
  total_spent DECIMAL(10,2) DEFAULT 0,
  packs_opened INT DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0
);

-- Index pour performance
CREATE INDEX idx_purchases_user ON purchases(user_id);
CREATE INDEX idx_purchases_opened ON purchases(opened_at) WHERE opened_at IS NOT NULL;