-- ============================================================
-- SETUP MATCH REVIEWS (VALORACIONES) - AUTO-CONTENIDO v2
-- Este script es completamente independiente.
-- Crea todas las tablas necesarias si no existen.
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- PASO 1: Crear match_events si NO existe (dependencia)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    opponent_name TEXT NOT NULL DEFAULT 'Rival',
    match_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'live', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_events_select" ON public.match_events;
CREATE POLICY "match_events_select"
    ON public.match_events FOR SELECT USING (true);

-- Poblar con partidos de prueba para San Marcelino
INSERT INTO public.match_events (team_id, opponent_name, match_date, status)
SELECT t.id, 'Fundació VCF ''A''', NOW() - INTERVAL '21 days', 'finished'
FROM public.teams t WHERE t.name ILIKE '%MARCELINO%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.match_events (team_id, opponent_name, match_date, status)
SELECT t.id, 'Torrent CF', NOW() - INTERVAL '14 days', 'finished'
FROM public.teams t WHERE t.name ILIKE '%MARCELINO%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.match_events (team_id, opponent_name, match_date, status)
SELECT t.id, 'U.D. Alzira', NOW() - INTERVAL '7 days', 'finished'
FROM public.teams t WHERE t.name ILIKE '%MARCELINO%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.match_events (team_id, opponent_name, match_date, status)
SELECT t.id, 'Villarreal B', NOW() + INTERVAL '7 days', 'upcoming'
FROM public.teams t WHERE t.name ILIKE '%MARCELINO%' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASO 2: Crear match_reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.match_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES public.match_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Calificaciones 1-5 estrellas
    match_rating     INTEGER CHECK (match_rating BETWEEN 1 AND 5),
    atmosphere_rating INTEGER CHECK (atmosphere_rating BETWEEN 1 AND 5),
    bar_rating       INTEGER CHECK (bar_rating BETWEEN 1 AND 5),
    referee_rating   INTEGER CHECK (referee_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE
        DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Un usuario solo puede valorar un partido una vez
    UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_reviews ENABLE ROW LEVEL SECURITY;

-- Todos ven las valoraciones
DROP POLICY IF EXISTS "reviews_select" ON public.match_reviews;
CREATE POLICY "reviews_select" ON public.match_reviews
    FOR SELECT USING (true);

-- Solo el propio usuario inserta la suya
DROP POLICY IF EXISTS "reviews_insert" ON public.match_reviews;
CREATE POLICY "reviews_insert" ON public.match_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede editar la suya
DROP POLICY IF EXISTS "reviews_update" ON public.match_reviews;
CREATE POLICY "reviews_update" ON public.match_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- PASO 3: Vista de promedios por partido
-- ============================================================
CREATE OR REPLACE VIEW public.match_review_averages AS
SELECT
    me.id AS match_id,
    me.opponent_name,
    me.match_date,
    me.status,
    COUNT(mr.id) AS total_reviews,
    ROUND(AVG(mr.match_rating)::numeric, 1)     AS avg_match,
    ROUND(AVG(mr.atmosphere_rating)::numeric, 1) AS avg_atmosphere,
    ROUND(AVG(mr.bar_rating)::numeric, 1)        AS avg_bar,
    ROUND(AVG(mr.referee_rating)::numeric, 1)    AS avg_referee
FROM public.match_events me
LEFT JOIN public.match_reviews mr ON me.id = mr.match_id
GROUP BY me.id, me.opponent_name, me.match_date, me.status;

-- ============================================================
-- Verificación final
-- ============================================================
SELECT
    'match_events'  AS tabla, COUNT(*) AS registros FROM public.match_events
UNION ALL
SELECT
    'match_reviews' AS tabla, COUNT(*) AS registros FROM public.match_reviews;
