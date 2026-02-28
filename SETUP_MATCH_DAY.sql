-- ============================================================
-- SETUP MATCH DAY HUB - EXPANSION 3 (PART 3)
-- ============================================================
-- Crea el sistema para visualizar alineaciones en vivo y
-- votar por el MVP cuando el partido finaliza.
-- ============================================================

-- 1. Tabla de Partidos (Events)
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    opponent_name TEXT NOT NULL,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver los partidos del equipo" ON public.match_events;
CREATE POLICY "Todos pueden ver los partidos del equipo" 
ON public.match_events FOR SELECT USING (true); -- Simplificado para la beta

-- 2. Tabla de Alineaciones (Opcional por ahora, usaremos perfiles estáticos en Flutter para la v1)
-- Pero la dejamos creada para el futuro donde el coach arrastre a los jugadores.
CREATE TABLE IF NOT EXISTS public.match_lineups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.match_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    position_x FLOAT NOT NULL, -- Porcentaje horizontal de la pantalla 0.0 a 1.0
    position_y FLOAT NOT NULL, -- Porcentaje vertical de la pantalla 0.0 a 1.0
    is_starter BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, user_id)
);

ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos pueden leer alineaciones" ON public.match_lineups;
CREATE POLICY "Todos pueden leer alineaciones" ON public.match_lineups FOR SELECT USING (true);


-- 3. Tabla de Votos MVP
CREATE TABLE IF NOT EXISTS public.match_mvp_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.match_events(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    voted_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(match_id, voter_id) -- Un voto por usuario por partido
);

ALTER TABLE public.match_mvp_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden ver los votos" ON public.match_mvp_votes;
CREATE POLICY "Todos pueden ver los votos" ON public.match_mvp_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios insertan su propio voto" ON public.match_mvp_votes;
CREATE POLICY "Usuarios insertan su propio voto" 
ON public.match_mvp_votes FOR INSERT 
WITH CHECK (auth.uid() = voter_id);

-- Insertar un partido de prueba "Dummy" para poder desarrollar la pantalla
-- Asume que hay equipos creados. Si esto falla por constraint fkey, ignorar.
DO $$ 
DECLARE
  v_team_id UUID;
BEGIN
  -- Intentar obtener un equipo UUID cualquiera del sistema
  SELECT id INTO v_team_id FROM public.teams LIMIT 1;
  
  IF v_team_id IS NOT NULL THEN
     INSERT INTO public.match_events (team_id, opponent_name, match_date, status)
     VALUES (v_team_id, 'Real Madrid Academy', NOW(), 'upcoming')
     ON CONFLICT DO NOTHING;
  END IF;
END $$;

SELECT 'Match Day Hub Database V1 successfully created' as status;
