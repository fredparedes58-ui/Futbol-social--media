-- ============================================================
-- KICKBASE SOCIAL MEDIA - Schema v5 (Zero ON CONFLICT issues)
-- Architecture decision: Use WHERE NOT EXISTS for ALL inserts.
-- This makes the script 100% independent of all constraints.
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
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
  media_type TEXT,
  media_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Post Interactions Table
CREATE TABLE IF NOT EXISTS public.post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  interaction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Parent-Child Links Table
CREATE TABLE IF NOT EXISTS public.parent_child_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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
-- RLS Policies (DROP + CREATE ensures idempotency)
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "players_select" ON public.players;
CREATE POLICY "players_select" ON public.players FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "interactions_select" ON public.post_interactions;
CREATE POLICY "interactions_select" ON public.post_interactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "links_select" ON public.parent_child_links;
CREATE POLICY "links_select" ON public.parent_child_links FOR SELECT USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "links_insert" ON public.parent_child_links;
CREATE POLICY "links_insert" ON public.parent_child_links FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- ============================================================
-- Seed Data: Teams (WHERE NOT EXISTS - zero constraint dependency)
-- ============================================================
INSERT INTO public.teams (name)
SELECT 'C.D. SAN MARCELINO A'
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'C.D. SAN MARCELINO A');

INSERT INTO public.teams (name)
SELECT 'C.F. FUNDACIO VCF A'
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'C.F. FUNDACIO VCF A');

INSERT INTO public.teams (name)
SELECT 'U.D. ALZIRA A'
WHERE NOT EXISTS (SELECT 1 FROM public.teams WHERE name = 'U.D. ALZIRA A');

-- ============================================================
-- Seed Data: Players (WHERE NOT EXISTS - zero constraint dependency)
-- ============================================================

-- SAN MARCELINO
INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Jaider', 'Castillo', 'Delantero', 88
FROM public.teams t
WHERE t.name = 'C.D. SAN MARCELINO A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Jaider' AND p.last_name = 'Castillo');

INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Lucas', 'Garcia', 'Mediocentro', 85
FROM public.teams t
WHERE t.name = 'C.D. SAN MARCELINO A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Lucas' AND p.last_name = 'Garcia');

INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Carlos', 'Martinez', 'Defensa', 80
FROM public.teams t
WHERE t.name = 'C.D. SAN MARCELINO A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Carlos' AND p.last_name = 'Martinez');

INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Mateo', 'Lopez', 'Portero', 82
FROM public.teams t
WHERE t.name = 'C.D. SAN MARCELINO A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Mateo' AND p.last_name = 'Lopez');

-- VCF
INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Leo', 'Messi', 'Extremo', 99
FROM public.teams t
WHERE t.name = 'C.F. FUNDACIO VCF A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Leo' AND p.last_name = 'Messi');

INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Adrian', 'Perez', 'Delantero', 78
FROM public.teams t
WHERE t.name = 'C.F. FUNDACIO VCF A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Adrian' AND p.last_name = 'Perez');

-- ALZIRA
INSERT INTO public.players (team_id, first_name, last_name, position, overall_rating)
SELECT t.id, 'Diego', 'Ramos', 'Mediocentro', 77
FROM public.teams t
WHERE t.name = 'U.D. ALZIRA A'
  AND NOT EXISTS (SELECT 1 FROM public.players p WHERE p.team_id = t.id AND p.first_name = 'Diego' AND p.last_name = 'Ramos');

-- ============================================================
-- Storage: posts bucket
-- ON CONFLICT (id) is safe - id is the PRIMARY KEY
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "storage_posts_select" ON storage.objects;
CREATE POLICY "storage_posts_select" ON storage.objects FOR SELECT USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "storage_posts_insert" ON storage.objects;
CREATE POLICY "storage_posts_insert" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "storage_posts_update" ON storage.objects;
CREATE POLICY "storage_posts_update" ON storage.objects FOR UPDATE
WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "storage_posts_delete" ON storage.objects;
CREATE POLICY "storage_posts_delete" ON storage.objects FOR DELETE
USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);
