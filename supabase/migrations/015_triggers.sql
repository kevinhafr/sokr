-- Fonction pour notifier les changements de jeu
CREATE OR REPLACE FUNCTION notify_game_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'game_updates',
    json_build_object(
      'game_id', NEW.id,
      'status', NEW.status,
      'current_player', NEW.current_player,
      'score_a', NEW.score_a,
      'score_b', NEW.score_b
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les notifications de changements de jeu
CREATE TRIGGER trigger_game_updates
AFTER UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION notify_game_change();

-- Triggers pour update_updated_at
CREATE TRIGGER trigger_updated_at_games
BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_updated_at_saved_decks
BEFORE UPDATE ON saved_decks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Triggers pour vérifier les limites lors des placements
CREATE TRIGGER trigger_check_team_cp
BEFORE INSERT OR UPDATE ON placements
FOR EACH ROW EXECUTE FUNCTION check_team_cp_limit();

CREATE TRIGGER trigger_check_zone_limit
BEFORE INSERT OR UPDATE ON placements
FOR EACH ROW EXECUTE FUNCTION check_zone_limit();

-- Fonction pour notifier les nouveaux moves
CREATE OR REPLACE FUNCTION notify_new_move()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'game_moves',
    json_build_object(
      'game_id', NEW.game_id,
      'move_id', NEW.id,
      'player_id', NEW.player_id,
      'action_type', NEW.action_type,
      'turn_number', NEW.turn_number
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les notifications de moves
CREATE TRIGGER trigger_move_notify
AFTER INSERT ON moves
FOR EACH ROW EXECUTE FUNCTION notify_new_move();

-- Fonction pour mettre à jour les stats des joueurs après un move
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour les stats du joueur acteur
  IF NEW.success THEN
    UPDATE user_players
    SET games_played = games_played + 1,
        duels_won = duels_won + 1
    WHERE user_id = NEW.player_id 
    AND player_id = NEW.actor_card_id;
    
    -- Si c'est un tir réussi
    IF NEW.action_type = 'shot' AND NEW.success THEN
      UPDATE user_players
      SET goals_scored = goals_scored + 1
      WHERE user_id = NEW.player_id 
      AND player_id = NEW.actor_card_id;
    END IF;
    
    -- Si c'est une passe décisive
    IF NEW.action_type = 'pass' AND EXISTS (
      SELECT 1 FROM moves 
      WHERE game_id = NEW.game_id 
      AND turn_number = NEW.turn_number + 1 
      AND action_type = 'shot' 
      AND success = true
    ) THEN
      UPDATE user_players
      SET assists_made = assists_made + 1
      WHERE user_id = NEW.player_id 
      AND player_id = NEW.actor_card_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les stats
CREATE TRIGGER trigger_update_stats
AFTER INSERT ON moves
FOR EACH ROW EXECUTE FUNCTION update_player_stats();

-- Fonction pour appliquer les XP gagnés
CREATE OR REPLACE FUNCTION apply_xp_gains()
RETURNS TRIGGER AS $$
DECLARE
  xp_entry RECORD;
BEGIN
  -- Parcourir les XP gagnés dans le move
  FOR xp_entry IN SELECT * FROM jsonb_each_text(NEW.xp_gained) LOOP
    UPDATE user_players
    SET xp = xp + xp_entry.value::INT,
        total_xp = total_xp + xp_entry.value::INT
    WHERE user_id = NEW.player_id 
    AND player_id = xp_entry.key::UUID;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appliquer les XP
CREATE TRIGGER trigger_apply_xp
AFTER INSERT ON moves
FOR EACH ROW EXECUTE FUNCTION apply_xp_gains();