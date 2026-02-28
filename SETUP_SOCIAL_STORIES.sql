-- ============================================================
-- SETUP_SOCIAL_STORIES.sql
-- ============================================================
-- 1. Crear cubo Storage 'stories'
-- 2. Crear tabla social_stories (con restricción de equipo y expiración)
-- 3. Crear vista que automáticamente descarta historias > 24h
-- ============================================================

-- 1. BUCKET DE STORAGE
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas Storage para 'stories'
DROP POLICY IF EXISTS "Public Acces TO stories read" ON storage.objects;
CREATE POLICY "Public Acces TO stories read" ON storage.objects FOR SELECT USING ( bucket_id = 'stories' );

DROP POLICY IF EXISTS "Only Auth Insert TO stories" ON storage.objects;
CREATE POLICY "Only Auth Insert TO stories" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'stories' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Only Owner Update Delete TO stories" ON storage.objects;
CREATE POLICY "Only Owner Update Delete TO stories" ON storage.objects FOR ALL USING ( bucket_id = 'stories' AND auth.uid() = owner );

-- 2. TABLA SOCIAL_STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.social_stories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    duration_seconds INTEGER DEFAULT 5, -- útil si metemos una foto, durará 5 seg en pantalla
    
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) + interval '24 hours' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;

-- OJO: Permitimos insertar. La visualización se basa en que pertenezcas al club
DROP POLICY IF EXISTS "Miembros pueden crear stories" ON public.social_stories;
CREATE POLICY "Miembros pueden crear stories" 
ON public.social_stories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Miembros pueden ver stories de su equipo si no han expirado" ON public.social_stories;
CREATE POLICY "Miembros pueden ver stories de su equipo si no han expirado" 
ON public.social_stories FOR SELECT 
USING (
    -- Validamos membresía
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
    -- Que no hayan pasado las 24 horas
    AND expires_at > timezone('utc'::text, now())
);

-- Índices de optimización: MUY IMPORTANTE EL TIEMPO PARA NO LEER BASURA CACHEADA
CREATE INDEX IF NOT EXISTS idx_social_stories_team_id ON public.social_stories(team_id);
CREATE INDEX IF NOT EXISTS idx_social_stories_user_id ON public.social_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_social_stories_expires_at ON public.social_stories(expires_at);

-- 3. VISTA ENRIQUECIDA (Solo devuelve las activas con nombre/avatar del autor)
-- ============================================================
DROP VIEW IF EXISTS public.active_social_stories_detailed;
CREATE OR REPLACE VIEW public.active_social_stories_detailed AS
SELECT 
    s.id,
    s.team_id,
    s.user_id,
    s.media_url,
    s.media_type,
    s.duration_seconds,
    s.expires_at,
    s.created_at,
    p.full_name as author_name,
    p.role as author_role,
    p.avatar_url as author_avatar_url
FROM 
    public.social_stories s
LEFT JOIN 
    public.profiles p ON s.user_id = p.id
WHERE
    s.expires_at > timezone('utc'::text, now()) -- ¡La clave de la magia 24h!
ORDER BY 
    s.created_at ASC; -- Las historias se ven de más vieja a más nueva

SELECT 'Tabla y Vista Social Stories Creada Exitosamente' as status;
