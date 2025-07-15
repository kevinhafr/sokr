-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Informations de base
  role user_role DEFAULT 'user',
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  
  -- Statistiques
  mmr INT DEFAULT 1000,
  total_games INT DEFAULT 0,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  
  -- Système de sanctions
  ban_until TIMESTAMPTZ,
  consecutive_abandons INT DEFAULT 0,
  last_abandon_at TIMESTAMPTZ,
  ban_count INT DEFAULT 0, -- Three-strikes system
  
  -- Préférences
  settings JSONB DEFAULT '{"sound": true, "vibration": true}'
);

-- Index pour performance
CREATE INDEX idx_profiles_mmr ON profiles(mmr);
CREATE INDEX idx_profiles_role ON profiles(role) WHERE role = 'admin';
CREATE INDEX idx_profiles_username ON profiles(username);

-- Index pour le matchmaking (sans WHERE clause car NOW() n'est pas immutable)
CREATE INDEX idx_profiles_matchmaking ON profiles(mmr, ban_until);