-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  joined_at TIMESTAMP WITH TIME ZONE
);

-- Create predictions table (group-stage scores)
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  match_id TEXT NOT NULL,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, match_id),
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Knockout bracket winner picks
CREATE TABLE IF NOT EXISTS public.knockout_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  match_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, match_id),
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS predictions_user_id_idx ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS predictions_match_id_idx ON public.predictions(match_id);
CREATE INDEX IF NOT EXISTS knockout_predictions_user_id_idx ON public.knockout_predictions(user_id);
CREATE INDEX IF NOT EXISTS users_joined_at_idx ON public.users(joined_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knockout_predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can view all knockout predictions" ON public.knockout_predictions;
DROP POLICY IF EXISTS "Users can insert own knockout predictions" ON public.knockout_predictions;
DROP POLICY IF EXISTS "Users can update own knockout predictions" ON public.knockout_predictions;
DROP POLICY IF EXISTS "Users can delete own knockout predictions" ON public.knockout_predictions;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- RLS Policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for predictions table
CREATE POLICY "Users can view all predictions" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own predictions" ON public.predictions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for knockout_predictions table
CREATE POLICY "Users can view all knockout predictions" ON public.knockout_predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own knockout predictions" ON public.knockout_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own knockout predictions" ON public.knockout_predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own knockout predictions" ON public.knockout_predictions FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_predictions_updated_at ON public.predictions;
DROP TRIGGER IF EXISTS update_knockout_predictions_updated_at ON public.knockout_predictions;

CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON public.predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knockout_predictions_updated_at BEFORE UPDATE ON public.knockout_predictions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create public.users row when auth.users is created (bypasses RLS at signup).
-- Do not call uuid_generate_v4() here — search_path = public hides the extension and breaks signup.
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