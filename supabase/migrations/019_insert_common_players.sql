-- Insert common player cards
INSERT INTO players (name, nationality, position, rarity, shot, dribble, pass, block, cp_cost, special_ability, image_url, edition, reroll_count) VALUES
-- Gardiens
('Hugo Santos', 'BRA', 'gardien', 'Common', 0, 0, 1, 3, 3, NULL, 'assets/players/common/santos.png', 'starter', 0),
('David Williams', 'ENG', 'gardien', 'Common', 0, 0, 2, 3, 3, NULL, 'assets/players/common/williams.png', 'starter', 0),
('Ahmed Hassan', 'EGY', 'gardien', 'Common', 0, 1, 1, 3, 3, NULL, 'assets/players/common/hassan.png', 'starter', 0),
('Luca Rossi', 'ITA', 'gardien', 'Common', 0, 0, 2, 3, 3, NULL, 'assets/players/common/rossi.png', 'starter', 0),

-- Défenseurs
('Matteo Bianchi', 'ITA', 'defenseur', 'Common', 0, 1, 2, 3, 4, NULL, 'assets/players/common/bianchi.png', 'starter', 0),
('Stefan Nowak', 'POL', 'defenseur', 'Common', 1, 0, 1, 3, 4, NULL, 'assets/players/common/nowak.png', 'starter', 0),
('Alexei Petrov', 'RUS', 'defenseur', 'Common', 0, 1, 1, 3, 4, NULL, 'assets/players/common/petrov.png', 'starter', 0),
('Lee Min-ho', 'KOR', 'defenseur', 'Common', 0, 0, 2, 3, 4, NULL, 'assets/players/common/minho.png', 'starter', 0),

-- Milieux
('Olivier Dupont', 'FRA', 'milieu', 'Common', 1, 2, 3, 1, 4, NULL, 'assets/players/common/dupont.png', 'starter', 0),
('Lars Eriksen', 'DEN', 'milieu', 'Common', 1, 1, 3, 2, 4, NULL, 'assets/players/common/eriksen.png', 'starter', 0),
('Hiroshi Tanaka', 'JPN', 'milieu', 'Common', 1, 3, 2, 1, 4, NULL, 'assets/players/common/tanaka.png', 'starter', 0),
('Thomas Schmidt', 'GER', 'milieu', 'Common', 2, 1, 3, 1, 4, NULL, 'assets/players/common/schmidt.png', 'starter', 0),

-- Attaquants
('Marco Torreblanca', 'ESP', 'attaquant', 'Common', 3, 2, 1, 0, 4, NULL, 'assets/players/common/torreblanca.png', 'starter', 0),
('Jamal Wilson', 'JAM', 'attaquant', 'Common', 2, 3, 1, 0, 4, NULL, 'assets/players/common/wilson.png', 'starter', 0),
('Carlos Mendoza', 'MEX', 'attaquant', 'Common', 3, 2, 2, 0, 4, NULL, 'assets/players/common/mendoza.png', 'starter', 0),
('Ibrahim Keita', 'SEN', 'attaquant', 'Common', 3, 3, 0, 0, 4, NULL, 'assets/players/common/keita.png', 'starter', 0);

-- Add edition tracking for these cards (10,000 copies each)
ALTER TABLE players ADD COLUMN IF NOT EXISTS total_editions INTEGER DEFAULT 10000;
ALTER TABLE players ADD COLUMN IF NOT EXISTS available_editions INTEGER DEFAULT 10000;

-- Update the starter cards with edition info
UPDATE players 
SET total_editions = 10000, available_editions = 10000 
WHERE edition = 'starter' AND rarity = 'Common';