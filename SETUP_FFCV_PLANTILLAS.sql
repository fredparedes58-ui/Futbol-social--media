-- ============================================================
-- SETUP FFCV PLANTILLAS - Equipos y Jugadores del Grup.-4
-- ============================================================
-- Ejecutar DESPUÉS de SETUP_FFCV_INTEGRATION.sql
-- ============================================================

-- 1. TABLA: Equipos del Grupo
CREATE TABLE IF NOT EXISTS public.ffcv_teams (
    id TEXT PRIMARY KEY,                  -- ID del equipo en isquad.es (ej: "16372")
    name TEXT NOT NULL,                   -- Nombre exacto de la FFCV
    short_name TEXT,                      -- Nombre corto para mostrar en la UI
    logo_url TEXT,                        -- URL del escudo desde isquad.es
    id_torneo TEXT DEFAULT '904327882',
    id_competicion TEXT DEFAULT '29509617',
    is_our_team BOOLEAN DEFAULT false,    -- TRUE solo para San Marcelino
    roster_url TEXT,                      -- URL de la plantilla en FFCV
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ffcv_teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos leen equipos FFCV" ON public.ffcv_teams;
CREATE POLICY "Todos leen equipos FFCV" ON public.ffcv_teams FOR SELECT USING (true);

-- 2. TABLA: Jugadores por Equipo (scrapeados de la FFCV)
CREATE TABLE IF NOT EXISTS public.ffcv_players (
    id TEXT PRIMARY KEY,                  -- ID del jugador en isquad.es
    team_id TEXT NOT NULL REFERENCES public.ffcv_teams(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    photo_url TEXT,                       -- Foto oficial de la FFCV
    is_coach BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ffcv_players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos leen jugadores FFCV" ON public.ffcv_players;
CREATE POLICY "Todos leen jugadores FFCV" ON public.ffcv_players FOR SELECT USING (true);

-- 3. TABLA: Goles por Partido (San Marcelino - Registro Manual)
CREATE TABLE IF NOT EXISTS public.match_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fixture_id TEXT REFERENCES public.ffcv_fixtures(id_partido) ON DELETE CASCADE,
    player_ffcv_id TEXT,                  -- ID del jugador en FFCV (puede ser NULL si se escribe manualmente)
    player_name TEXT NOT NULL,            -- Nombre del goleador
    minute INTEGER,                       -- Minuto del gol (opcional para benjamines)
    is_own_goal BOOLEAN DEFAULT false,    -- Gol en propia puerta
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.match_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos leen goles" ON public.match_goals;
CREATE POLICY "Todos leen goles" ON public.match_goals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin registra goles" ON public.match_goals;
CREATE POLICY "Admin registra goles" ON public.match_goals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. TABLA: Resultados Registrados Manualmente
CREATE TABLE IF NOT EXISTS public.match_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fixture_id TEXT UNIQUE REFERENCES public.ffcv_fixtures(id_partido) ON DELETE CASCADE,
    our_goals INTEGER NOT NULL DEFAULT 0,
    rival_goals INTEGER NOT NULL DEFAULT 0,
    notes TEXT,                           -- Notas del partido (ej: "Gran partido de Jaider")
    registered_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Todos leen resultados" ON public.match_results;
CREATE POLICY "Todos leen resultados" ON public.match_results FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin registra resultados" ON public.match_results;
CREATE POLICY "Admin registra resultados" ON public.match_results FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Admin actualiza resultados" ON public.match_results;
CREATE POLICY "Admin actualiza resultados" ON public.match_results FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 5. INSERTAR los 13 equipos del Grup.-4 directamente (Datos conocidos del scraping)
INSERT INTO public.ffcv_teams (id, name, short_name, logo_url, roster_url, is_our_team) VALUES
('20887',  'C.F. Fundació VCF ''A''',           'VCF',          null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=20887&id_torneo=904327882', false),
('14995',  'U.D. Alzira ''A''',                  'Alzira',       null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=14995&id_torneo=904327882', false),
('15250',  'C.D. Monte-Sión ''A''',              'Monte-Sión',   null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=15250&id_torneo=904327882', false),
('14793',  'F.B.C.D. Catarroja ''B''',           'Catarroja',    null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=14793&id_torneo=904327882', false),
('21932',  'C.F. Sporting Xirivella ''C''',      'Xirivella',    null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=21932&id_torneo=904327882', false),
('15745',  'Col. Salgui E.D.E. ''A''',           'Salgui',       null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=15745&id_torneo=904327882', false),
('16900',  'C.F.B. Ciutat de València ''A''',    'Ciutat VLC',   null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=16900&id_torneo=904327882', false),
('17086',  'F.B.U.E. Atlètic Amistat ''A''',     'At. Amistat',  null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=17086&id_torneo=904327882', false),
('13674',  'Unió Benetússer-Favara C.F. ''A''',  'Benetússer',   null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=13674&id_torneo=904327882', false),
('16372',  'C.D. San Marcelino ''A''',            'San Marcelino',null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=16372&id_torneo=904327882', true),
('14632',  'Torrent C.F. ''C''',                  'Torrent',      null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=14632&id_torneo=904327882', false),
('22299222','Picassent C.F. ''A''',               'Picassent',    null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=22299222&id_torneo=904327882', false),
('15795',  'C.D. Don Bosco ''A''',                'Don Bosco',    null, 'https://resultadosffcv.isquad.es/equipo_plantilla.php?id_competicion=29509617&id_equipo=15795&id_torneo=904327882', false)
ON CONFLICT (id) DO NOTHING;

-- 6. INSERTAR la plantilla completa del San Marcelino (datos del scraping)
INSERT INTO public.ffcv_players (id, team_id, full_name, is_coach) VALUES
('9853257',   '16372', 'ALCIBAR GOMEZ, JAIDER ANDRES',       false),
('902237996', '16372', 'ARCOBA BIOT, JORGE',                  false),
('9832396',   '16372', 'BALLESTEROS HUERTA, ALEJANDRO',       false),
('9853256',   '16372', 'CABEZA CAÑAS, MARTIN',                false),
('21841904',  '16372', 'DOLZ SANCHEZ, IKER',                  false),
('902438972', '16372', 'LAZURAN, RAUL',                        false),
('9843680',   '16372', 'LILLO AVILA, UNAI',                   false),
('21840086',  '16372', 'MARTÍNEZ RIAZA, HUGO',                false),
('900118630', '16372', 'PAREDES CASTRO, SAMUEL ALEJANDRO',    false),
('9843195',   '16372', 'PARRAGA MORENO, JULEN',               false),
('900327208', '16372', 'RAMOS GONZALEZ, DYLAN STEVEN',        false),
('29268543',  '16372', 'RINCON SANCHEZ, EMMANUEL',             false),
('904299009', '16372', 'RODRIGUEZ GIMENEZ, MARCOS',            false),
('coach_sm1', '16372', 'FARINOS CERVERA, JOSE EMILIO',        true)
ON CONFLICT (id) DO NOTHING;

SELECT 'Plantillas FFCV V1 + San Marcelino insertados correctamente' AS status;
