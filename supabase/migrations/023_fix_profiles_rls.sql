-- Supprimer la contrainte de clé étrangère si elle existe
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recréer la contrainte avec la bonne référence
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Supprimer les anciennes politiques de profiles
DROP POLICY IF EXISTS "Public profiles viewable" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Créer des politiques plus permissives pour profiles
-- Tout le monde peut voir les profils publics
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Les utilisateurs authentifiés peuvent créer leur propre profil
CREATE POLICY "Authenticated users can create their profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Les utilisateurs ne peuvent pas supprimer leur profil
CREATE POLICY "Users cannot delete profiles"
  ON profiles FOR DELETE
  USING (false);

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

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created_profiles ON auth.users;

-- Créer un trigger sur auth.users pour créer automatiquement le profil
CREATE TRIGGER on_auth_user_created_profiles
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_auth();

-- Donner les permissions nécessaires
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;