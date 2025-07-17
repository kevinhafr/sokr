-- Ajouter une colonne pour marquer si l'utilisateur a reçu ses cartes de départ
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS starter_cards_received BOOLEAN DEFAULT FALSE;

-- Fonction pour attribuer les cartes au premier login (pas à la création)
CREATE OR REPLACE FUNCTION public.assign_starter_cards(p_user_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  starter_card RECORD;
  cards_assigned INTEGER := 0;
  deck_cards UUID[] := '{}';
  goalkeeper_count INTEGER := 0;
  defender_count INTEGER := 0;
  midfielder_count INTEGER := 0;
  attacker_count INTEGER := 0;
BEGIN
  -- Vérifier si l'utilisateur a déjà reçu ses cartes
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND starter_cards_received = TRUE) THEN
    RAISE LOG 'User % already received starter cards', p_user_id;
    RETURN;
  END IF;
  
  RAISE LOG 'Assigning starter cards to user % on first login', p_user_id;
  
  -- 1. Assigner 1 gardien aléatoire
  RAISE LOG 'Looking for goalkeepers...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'gardien' AND rarity = 'Common'
    ORDER BY RANDOM()
    LIMIT 1
  LOOP
    RAISE LOG 'Assigning goalkeeper % to user %', starter_card.id, p_user_id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (p_user_id, starter_card.id, NOW());
    
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
    RAISE LOG 'Assigning defender % to user %', starter_card.id, p_user_id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (p_user_id, starter_card.id, NOW());
    
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
    RAISE LOG 'Assigning midfielder % to user %', starter_card.id, p_user_id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (p_user_id, starter_card.id, NOW());
    
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
    RAISE LOG 'Assigning attacker % to user %', starter_card.id, p_user_id;
    INSERT INTO public.user_players (user_id, player_id, obtained_at)
    VALUES (p_user_id, starter_card.id, NOW());
    
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
    RAISE LOG 'Creating first deck for user % with % cards', p_user_id, array_length(deck_cards, 1);
    
    INSERT INTO public.saved_decks (
      user_id, 
      name, 
      cards, 
      total_cp,
      is_valid,
      is_favorite
    ) VALUES (
      p_user_id,
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
    RAISE WARNING 'No cards were assigned to user %', p_user_id;
  END IF;
  
  -- Marquer que l'utilisateur a reçu ses cartes
  UPDATE profiles 
  SET starter_cards_received = TRUE
  WHERE id = p_user_id;

EXCEPTION WHEN OTHERS THEN
  -- En cas d'erreur, logger mais ne pas bloquer
  RAISE LOG 'Error assigning starter cards to user %: %', p_user_id, SQLERRM;
END;
$$;

-- Fonction pour appeler depuis l'application au premier login
CREATE OR REPLACE FUNCTION public.check_and_assign_starter_cards()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cette fonction sera appelée par l'application au login
  -- L'utilisateur est identifié par auth.uid()
  PERFORM assign_starter_cards(auth.uid());
END;
$$;

-- Donner les permissions pour exécuter cette fonction
GRANT EXECUTE ON FUNCTION public.check_and_assign_starter_cards() TO authenticated;

-- Fonction pour calculer le total_cp d'un deck
CREATE OR REPLACE FUNCTION calculate_deck_cp()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
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
$$;

-- Trigger pour calculer automatiquement le total_cp
CREATE TRIGGER trigger_calculate_deck_cp
BEFORE INSERT OR UPDATE ON saved_decks
FOR EACH ROW EXECUTE FUNCTION calculate_deck_cp();