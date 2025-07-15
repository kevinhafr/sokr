-- Function pour assigner les cartes de départ quand un profil est créé
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  starter_card RECORD;
  cards_assigned INTEGER := 0;
BEGIN
  RAISE LOG 'handle_new_user triggered for profile %', NEW.id;
  
  -- On n'a plus besoin de créer le profil car on est déjà sur un INSERT de profiles !
  -- Le profil est créé par AuthContext côté client

  -- 2. Assigner des cartes aléatoires : 1 gardien, 3 défenseurs, 3 milieux, 4 attaquants
  -- 2.1 Assigner 1 gardien aléatoire
  RAISE LOG 'Looking for goalkeepers...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'gardien'
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
  END LOOP;

  -- 2.2 Assigner 3 défenseurs aléatoires
  RAISE LOG 'Looking for defenders...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'defenseur'
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
  END LOOP;

  -- 2.3 Assigner 3 milieux aléatoires
  RAISE LOG 'Looking for midfielders...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'milieu'
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
  END LOOP;

  -- 2.4 Assigner 4 attaquants aléatoires
  RAISE LOG 'Looking for attackers...';
  FOR starter_card IN 
    SELECT id, cp_cost 
    FROM public.players 
    WHERE position = 'attaquant'
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
  END LOOP;

  -- Pas de création de deck automatique
  -- Le deck sera constitué automatiquement en quickgame ou manuellement en partie normale
  
  RAISE LOG 'Total cards assigned: %', cards_assigned;
  
  -- Vérifier s'il y a des cartes disponibles
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

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- Créer le trigger sur la table profiles (pas auth.users !)
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Permissions spécifiques pour le trigger sur auth.users
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO postgres, service_role;