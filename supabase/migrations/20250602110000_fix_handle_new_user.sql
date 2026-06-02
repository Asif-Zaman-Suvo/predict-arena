-- Fixes: "Database error saving new user" (broken auth.users trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_name text;
  profile_seed text;
BEGIN
  profile_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
    'Predictor'
  );
  profile_seed := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_seed'), ''),
    NEW.id::text
  );

  INSERT INTO public.users (id, display_name, avatar_seed, joined_at)
  VALUES (NEW.id, profile_name, profile_seed, TIMEZONE('utc', NOW()))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
