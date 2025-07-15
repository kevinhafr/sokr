-- Fonction pour calculer les changements de MMR (ELO)
CREATE OR REPLACE FUNCTION calculate_mmr_change(
  winner_mmr INT,
  loser_mmr INT,
  is_draw BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  k_factor INT := 32;
  expected_winner DECIMAL;
  expected_loser DECIMAL;
  change_winner INT;
  change_loser INT;
BEGIN
  expected_winner := 1.0 / (1.0 + POWER(10, (loser_mmr - winner_mmr) / 400.0));
  expected_loser := 1.0 - expected_winner;
  
  IF is_draw THEN
    change_winner := ROUND(k_factor * (0.5 - expected_winner));
    change_loser := ROUND(k_factor * (0.5 - expected_loser));
  ELSE
    change_winner := ROUND(k_factor * (1 - expected_winner));
    change_loser := ROUND(k_factor * (0 - expected_loser));
  END IF;
  
  RETURN jsonb_build_object(
    'winner_change', change_winner,
    'loser_change', change_loser
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction assign_starter_deck supprimée - on utilise le trigger handle_new_user à la place

-- Fonction pour vérifier la limite CP d'une équipe
CREATE OR REPLACE FUNCTION check_team_cp_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_cp INT;
BEGIN
  SELECT SUM(p.cp_cost) INTO total_cp
  FROM placements pl
  JOIN players p ON pl.card_id = p.id
  WHERE pl.game_id = NEW.game_id
  AND pl.player_id = NEW.player_id
  AND NOT pl.is_substitute;
  
  IF total_cp > 20 THEN
    RAISE EXCEPTION 'Limite CP de l''équipe dépassée (max 20)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier la limite de zone
CREATE OR REPLACE FUNCTION check_zone_limit()
RETURNS TRIGGER AS $$
DECLARE
  zone_count INT;
BEGIN
  -- Extraire la zone de la position (Z1, Z2, Z3)
  SELECT COUNT(*) INTO zone_count
  FROM placements
  WHERE game_id = NEW.game_id
  AND position LIKE SUBSTRING(NEW.position FROM 1 FOR 2) || '%'
  AND id != NEW.id;
  
  IF zone_count >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 cartes par zone';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;