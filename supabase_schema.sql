-- ============================================================
-- KICKBASE SOCIAL MEDIA - Supabase Schema (v3 - Full, Idempotent)
-- Run the ENTIRE file in your Supabase SQL Editor.
-- Safe to re-run multiple times without errors.
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('padre', 'jugador', 'entrenador', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  shield_url TEXT,
  club_id UUID
);

-- 3. Players Table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT,
  overall_rating INTEGER,
  avatar_url TEXT
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  media_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Post Interactions Table
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('like', 'share')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(post_id, user_id, interaction_type)
);

-- 5.1 Parent-Child Links Table
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(parent_id, player_id)
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Teams are viewable by everyone." ON public.teams;
CREATE POLICY "Teams are viewable by everyone." ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players are viewable by everyone." ON public.players;
CREATE POLICY "Players are viewable by everyone." ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Posts are viewable by everyone." ON public.posts;
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own posts." ON public.posts;
CREATE POLICY "Users can insert own posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Interactions are viewable by everyone." ON public.post_interactions;
CREATE POLICY "Interactions are viewable by everyone." ON public.post_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Parents can view their own links." ON public.parent_child_links;
CREATE POLICY "Parents can view their own links." ON public.parent_child_links FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can create their own links." ON public.parent_child_links;
CREATE POLICY "Parents can create their own links." ON public.parent_child_links FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- ============================================================
-- Demo Teams (idempotent)
-- ============================================================
INSERT INTO public.teams (name) VALUES
  ('C.D. SAN MARCELINO ''A'''),
  ('C.F. FUNDACIÓ VCF ''A'''),
  ('U.D. ALZIRA ''A''')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 6. Storage: 'posts' bucket + Policies
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'posts' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1] );

DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING ( bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1] );
