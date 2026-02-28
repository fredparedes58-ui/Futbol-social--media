-- ============================================================
-- SCRIPT 0: SETUP DEL ESQUEMA CENTRAL (NUCLEO)
-- ============================================================
-- Este script crea las tablas bases que TODO el resto del sistema 
-- (chat, feed, estadisticas, etc.) necesita para funcionar.
-- ============================================================

-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLAS BASE
-- ============================================================

-- A. Perfiles de Usuario (Usuarios registrados en Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT DEFAULT 'assets/images/default_avatar.png',
  position TEXT,
  jersey_number INTEGER,
  nickname TEXT,
  role TEXT DEFAULT 'player', -- Valores típicos: admin, coach, player, parent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar y configurar RLS simple para Perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- B. Clubes
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  admin_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clubs viewable by everyone" ON public.clubs;
CREATE POLICY "Clubs viewable by everyone" ON public.clubs FOR SELECT USING (true);


-- C. Equipos Generales (El que causó el error)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT, -- Prebenjamin, Alevin, etc.
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teams viewable by everyone" ON public.teams;
CREATE POLICY "Teams viewable by everyone" ON public.teams FOR SELECT USING (true);


-- D. Miembros del Equipo (Donde se enlaza a cada perfil con el equipo y su rol)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player' CHECK (role IN ('coach', 'admin', 'player', 'parent')),
  
  -- Campos para el sistema de chat y representación
  is_representative BOOLEAN DEFAULT FALSE,
  represented_player_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team members viewable by genuine members" ON public.team_members;
CREATE POLICY "Team members viewable by genuine members" ON public.team_members FOR SELECT USING (true);


-- E. Jugadores Específicos (Para estadísticas y match stats)
CREATE TABLE IF NOT EXISTS public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Opcional, si el jugador usa la app
  name TEXT NOT NULL,
  jersey_number INTEGER,
  position TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Players viewable by everyone" ON public.players;
CREATE POLICY "Players viewable by everyone" ON public.players FOR SELECT USING (true);


-- ============================================================
-- 3. AUTOMATIZACIÓN (TRIGGERS)
-- ============================================================

-- Trigger para crear un perfil automáticamente cuando un usuario se registra en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Nuevo Usuario'),
    COALESCE(new.raw_user_meta_data->>'role', 'parent')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- MENSAJE DE ÉXITO
SELECT 'Tablas Básicas (teams, profiles, team_members, etc) Creadas Exitosamente' as status;
