-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Énumérations
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TYPE game_status AS ENUM (
  'initializing',
  'waitingForPlayers', 
  'coinToss',
  'placement',
  'placementTeamA',
  'placementTeamB',
  'placementLocked',
  'active',
  'activeTurnA',
  'activeTurnB',
  'halfTime',
  'completed',
  'abandoned'
);

CREATE TYPE card_rarity AS ENUM ('Common', 'Limited', 'Rare', 'SuperRare', 'Unique');

CREATE TYPE player_position AS ENUM ('gardien', 'defenseur', 'milieu', 'attaquant');

CREATE TYPE board_position AS ENUM (
  'G1', 
  'Z1-1', 'Z1-2', 'Z1-3',
  'Z2-1', 'Z2-2', 'Z2-3',
  'Z3-1', 'Z3-2', 'Z3-3',
  'G2'
);

CREATE TYPE action_type AS ENUM ('pass', 'shot', 'dribble', 'substitute', 'play_bonus');

CREATE TYPE game_result AS ENUM ('win', 'loss', 'draw', 'abandon');