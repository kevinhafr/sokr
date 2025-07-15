-- Modifier la fonction handle_new_user pour créer automatiquement un deck
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  starter_card RECORD;
  cards_assigned INTEGER := 0;
  deck_cards UUID[] := '{}';
  goalkeeper_count INTEGER := 0;
  defender_count INTEGER := 0;
  midfielder_count INTEGER := 0;
  attacker_count INTEGER := 0;
BEGIN
  RAISE LOG 'handle_new_user triggered for profile %', NEW.id;
  
  -- 1. Assigner 1 gardien aléatoire
  RAISE LOG 'Looking for goalkeepers...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'gardien' AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 1
  LOOP
    RAISE LOG 'Assigning goalkeeper % to user %', starter_card.id, NEW.id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (NEW.id, starter_card.id, NOW());
    
    UPDATE public.players 
    SET available_editions = available_editions - 1
    WHERE id = starter_card.id;
    
    cards_assigned := cards_assigned + 1;
    deck_cards := array_append(deck_cards, starter_card.id);
    goalkeeper_count := goalkeeper_count + 1;
  END LOOP;

  -- 2. Assigner 3 défenseurs aléatoires
  RAISE LOG 'Looking for defenders...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'defenseur' AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 3
  LOOP
    RAISE LOG 'Assigning defender % to user %', starter_card.id, NEW.id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (NEW.id, starter_card.id, NOW());
    
    UPDATE public.players 
    SET available_editions = available_editions - 1
    WHERE id = starter_card.id;
    
    cards_assigned := cards_assigned + 1;
    -- Ajouter seulement 2 ou 3 défenseurs au deck (pour faire 8 cartes total)
    IF defender_count < 2 THEN
      deck_cards := array_append(deck_cards, starter_card.id);
      defender_count := defender_count + 1;
    END IF;
  END LOOP;

  -- 3. Assigner 3 milieux aléatoires
  RAISE LOG 'Looking for midfielders...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'milieu' AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 3
  LOOP
    RAISE LOG 'Assigning midfielder % to user %', starter_card.id, NEW.id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (NEW.id, starter_card.id, NOW());
    
    UPDATE public.players 
    SET available_editions = available_editions - 1
    WHERE id = starter_card.id;
    
    cards_assigned := cards_assigned + 1;
    -- Ajouter tous les 3 milieux au deck
    deck_cards := array_append(deck_cards, starter_card.id);
    midfielder_count := midfielder_count + 1;
  END LOOP;

  -- 4. Assigner 4 attaquants aléatoires
  RAISE LOG 'Looking for attackers...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'attaquant' AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 4
  LOOP
    RAISE LOG 'Assigning attacker % to user %', starter_card.id, NEW.id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (NEW.id, starter_card.id, NOW());
    
    UPDATE public.players 
    SET available_editions = available_editions - 1
    WHERE id = starter_card.id;
    
    cards_assigned := cards_assigned + 1;
    -- Ajouter seulement 2 attaquants au deck (pour faire 8 cartes total)
    IF attacker_count < 2 THEN
      deck_cards := array_append(deck_cards, starter_card.id);
      attacker_count := attacker_count + 1;
    END IF;
  END LOOP;

  -- 5. Créer le premier deck automatiquement avec 8 cartes
  -- Formation 1-2-3-2 (1 gardien, 2 défenseurs, 3 milieux, 2 attaquants)
  IF array_length(deck_cards, 1) = 8 THEN
    RAISE LOG 'Creating first deck for user % with % cards', NEW.id, array_length(deck_cards, 1);
    
    INSERT INTO public.saved_decks (
      user_id, 
      name, 
      cards, 
      total_cp,
      is_valid,
      is_favorite
    ) VALUES (
      NEW.id,
      'Mon premier deck',
      to_jsonb(deck_cards),
      0, -- Le total_cp sera calculé par un trigger ou une fonction
      true,
      true -- Le premier deck est automatiquement favori
    );
    
    RAISE LOG 'First deck created successfully';
  ELSE
    RAISE WARNING 'Could not create deck: expected 8 cards, got %', array_length(deck_cards, 1);
  END IF;
  
  RAISE LOG 'Total cards assigned: %', cards_assigned;
  
  IF cards_assigned = 0 THEN
    RAISE WARNING 'No cards were assigned to user %. Check if players table has available cards.', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, logger mais ne pas bloquer la création de l'utilisateur
  RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer le total_cp d'un deck
CREATE OR REPLACE FUNCTION calculate_deck_cp()
RETURNS TRIGGER AS $$
DECLARE
  total_cp INTEGER := 0;
  card_id UUID;
BEGIN
  -- Calculer le total des CP pour les cartes du deck
  FOR card_id IN SELECT jsonb_array_elements_text(NEW.cards)::UUID
  LOOP
    total_cp := total_cp + COALESCE((
      SELECT cp_cost FROM players WHERE id = card_id
    ), 0);
  END LOOP;
  
  NEW.total_cp := total_cp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement le total_cp
CREATE TRIGGER trigger_calculate_deck_cp
BEFORE INSERT OR UPDATE ON saved_decks
FOR EACH ROW EXECUTE FUNCTION calculate_deck_cp();