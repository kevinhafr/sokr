-- Table des cartes bonus
CREATE TABLE bonus_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  type TEXT CHECK (type IN ('Play', 'Condition')),
  effect TEXT NOT NULL,
  duration INT DEFAULT 0, -- 0 pour Play, 1-2 pour Condition
  timing TEXT CHECK (timing IN ('immediate', 'turn_start', 'reaction')),
  
  -- Métadonnées
  set_name TEXT DEFAULT 'base',
  card_number INT,
  is_active BOOLEAN DEFAULT true
);

-- Insertion des 11 cartes bonus du set de base
INSERT INTO bonus_cards (name, emoji, type, effect, duration, timing, card_number) VALUES
('Double Action', '🔄', 'Play', 'Un joueur agit deux fois ce tour', 0, 'immediate', 1),
('Carton Rouge', '🚫', 'Play', 'Exclut 1 joueur adverse pour 1 tour', 0, 'immediate', 2),
('Relance de Dé', '🎲', 'Play', 'Relance 1 dé que tu viens de lancer', 0, 'immediate', 3),
('Changement Express', '🔁', 'Play', 'Remplace un joueur qui peut agir immédiatement', 0, 'immediate', 4),
('Mur Défensif', '🛡', 'Condition', 'Annule la 1ère action offensive adverse/tour', 2, 'turn_start', 5),
('Précision Parfaite', '🎯', 'Play', 'Ta prochaine Passe/Tir compte comme 6', 0, 'immediate', 6),
('Rush Offensif', '➡️', 'Play', 'Avance la balle d''1 zone sans action', 0, 'immediate', 7),
('1 vs 1 Maîtrisé', '⚔️', 'Play', 'Gagne automatiquement le prochain duel', 0, 'immediate', 8),
('Tir Surprise', '💥', 'Play', 'Autorise un Tir depuis n''importe quelle zone', 0, 'immediate', 9),
('Tir Double', '🎯', 'Play', 'Lance 2D6 au prochain Tir, garde le meilleur', 0, 'immediate', 10),
('Temps Gelé', '🕰', 'Condition', 'L''adversaire ne peut pas jouer de cartes Bonus', 1, 'turn_start', 11);

-- Index pour performance
CREATE INDEX idx_bonus_cards_active ON bonus_cards(is_active) WHERE is_active = true;