-- Fonction pour gérer la création de profil après inscription
CREATE OR REPLACE FUNCTION public.handle_new_user_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un profil pour le nouvel utilisateur
  INSERT INTO public.profiles (id, username, email, role, mmr)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NEW.email,
    'user',
    1000
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Le profil existe déjà, ne rien faire
    RETURN NEW;
  WHEN OTHERS THEN
    -- En cas d'autre erreur, logger mais ne pas bloquer
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger sur auth.users pour créer automatiquement le profil
CREATE TRIGGER on_auth_user_created_profiles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auth();

-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Permissions spécifiques pour le trigger sur auth.users
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT SELECT ON auth.users TO postgres, service_role;