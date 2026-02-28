-- ============================================================
-- SETUP INTEGRACIÓN FFCV - Scraping de Datos Oficiales
-- ============================================================
-- Tablas para guardar los datos extraídos de la FFCV
-- (resultadosffcv.isquad.es) en tu propia base de datos.
-- ============================================================

-- 1. Tabla de Clasificación (Standings)
CREATE TABLE IF NOT EXISTS public.ffcv_standings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id_ffcv TEXT NOT NULL,         -- ID del equipo en la FFCV
    team_name TEXT NOT NULL,             -- Nombre del equipo (ej: "CF VCF Fundació 'A'")
    team_logo_url TEXT,                  -- URL del escudo desde isquad.es
    position INTEGER NOT NULL,           -- Posición en la tabla (#1, #2...)
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_difference INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    -- Parámetros de la competición (para poder filtrar por equipo/torneo)
    id_torneo TEXT NOT NULL,             -- 904327882 para Grup.-4
    id_competicion TEXT NOT NULL,        -- 29509617
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(id_torneo, team_id_ffcv)
);

ALTER TABLE public.ffcv_standings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos pueden leer la clasificacion FFCV" ON public.ffcv_standings;
CREATE POLICY "Todos pueden leer la clasificacion FFCV"
ON public.ffcv_standings FOR SELECT USING (true);


-- 2. Tabla de Calendarlo / Partidos (Fixtures)
CREATE TABLE IF NOT EXISTS public.ffcv_fixtures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_partido TEXT NOT NULL UNIQUE,     -- ID único del partido en la FFCV
    id_torneo TEXT NOT NULL,
    jornada INTEGER,                     -- Número de jornada
    home_team_name TEXT NOT NULL,
    away_team_name TEXT NOT NULL,
    home_team_logo_url TEXT,
    away_team_logo_url TEXT,
    home_goals INTEGER,                  -- NULL si no se ha jugado aún
    away_goals INTEGER,
    match_date TIMESTAMP WITH TIME ZONE, -- Fecha y hora del partido
    venue_name TEXT,                     -- Campo donde se juega
    venue_address TEXT,                  -- Dirección del campo (para el mapa)
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ffcv_fixtures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos pueden leer fixtures FFCV" ON public.ffcv_fixtures;
CREATE POLICY "Todos pueden leer fixtures FFCV"
ON public.ffcv_fixtures FOR SELECT USING (true);


-- 3. Tabla de Configuración del Equipo (Parámetros FFCV)
-- Vincular nuestro equipo con los IDs de la FFCV para el scraper
CREATE TABLE IF NOT EXISTS public.ffcv_team_config (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    ffcv_team_name TEXT NOT NULL,        -- Nombre exacto como aparece en la FFCV
    id_temp TEXT DEFAULT '21',           -- Temporada
    id_modalidad TEXT DEFAULT '33345',   -- MASCLÍ F8
    id_competicion TEXT DEFAULT '29509617', -- Primera FFCV Benjamí 2n. any Valencia
    id_torneo TEXT DEFAULT '904327882',  -- Grup.-4
    UNIQUE(team_id)
);

ALTER TABLE public.ffcv_team_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin puede gestionar config FFCV" ON public.ffcv_team_config;
CREATE POLICY "Todos leen config FFCV" ON public.ffcv_team_config FOR SELECT USING (true);

SELECT 'FFCV Integration Database V1 successfully created' as status;
