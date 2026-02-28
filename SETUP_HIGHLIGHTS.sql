-- ============================================================
-- SETUP HIGHLIGHTS (REELS) TIKTOK-STYLE (PART 1 OF EXPANSION 3)
-- ============================================================
-- Tablas necesarias: 
-- 1. social_highlights (Guarda los videos verticales y descripciones cortas)
-- 2. highlight_likes (Guarda quien ha dado like para que el corazón se vea rojo)
-- ============================================================

-- Tabla Principal
CREATE TABLE IF NOT EXISTS public.social_highlights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    description TEXT,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    views_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.social_highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden leer highlights del equipo" ON public.social_highlights;
CREATE POLICY "Todos pueden leer highlights del equipo" 
ON public.social_highlights FOR SELECT 
USING (
    team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
    OR
    team_id IN (
        SELECT t.id FROM teams t
        JOIN clubs c ON t.club_id = c.id
        WHERE c.id IN (
            SELECT t2.club_id FROM teams t2
            JOIN team_members tm ON t2.id = tm.team_id
            WHERE tm.user_id = auth.uid()
        )
    )
);

DROP POLICY IF EXISTS "Usuarios pueden subir highlights" ON public.social_highlights;
CREATE POLICY "Usuarios pueden subir highlights" 
ON public.social_highlights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar sus highlights" ON public.social_highlights;
CREATE POLICY "Usuarios pueden borrar sus highlights" 
ON public.social_highlights FOR DELETE 
USING (auth.uid() = user_id);


-- Tabla de Likes para interactuar
CREATE TABLE IF NOT EXISTS public.highlight_likes (
    highlight_id UUID NOT NULL REFERENCES public.social_highlights(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (highlight_id, user_id)
);

ALTER TABLE public.highlight_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios leen todos los likes" ON public.highlight_likes;
CREATE POLICY "Usuarios leen todos los likes" ON public.highlight_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden dar like" ON public.highlight_likes;
CREATE POLICY "Usuarios pueden dar like" ON public.highlight_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden quitar like" ON public.highlight_likes;
CREATE POLICY "Usuarios pueden quitar like" ON public.highlight_likes FOR DELETE USING (auth.uid() = user_id);


-- Triggers para conteo automático de likes
CREATE OR REPLACE FUNCTION increment_highlight_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.social_highlights
  SET likes_count = likes_count + 1
  WHERE id = NEW.highlight_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_highlight_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.social_highlights
  SET likes_count = likes_count - 1
  WHERE id = OLD.highlight_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_increment_highlight_like ON public.highlight_likes;
CREATE TRIGGER tr_increment_highlight_like
  AFTER INSERT ON public.highlight_likes
  FOR EACH ROW EXECUTE FUNCTION increment_highlight_likes();

DROP TRIGGER IF EXISTS tr_decrement_highlight_like ON public.highlight_likes;
CREATE TRIGGER tr_decrement_highlight_like
  AFTER DELETE ON public.highlight_likes
  FOR EACH ROW EXECUTE FUNCTION decrement_highlight_likes();


-- Vista enriquecida para pintar los videos
DROP VIEW IF EXISTS public.social_highlights_detailed;
CREATE OR REPLACE VIEW public.social_highlights_detailed AS
SELECT 
    sh.id,
    sh.team_id,
    sh.user_id,
    sh.video_url,
    sh.description,
    sh.likes_count,
    sh.views_count,
    sh.created_at,
    p.full_name as author_name,
    p.avatar_url as author_avatar_url,
    p.role as author_role
FROM 
    public.social_highlights sh
JOIN 
    public.profiles p ON sh.user_id = p.id;

-- RPC Function para incrementar vistas invisiblemente desde Flutter
CREATE OR REPLACE FUNCTION increment_highlight_view_count(p_highlight_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.social_highlights
  SET views_count = views_count + 1
  WHERE id = p_highlight_id;
END;
$$;

SELECT 'Highlights Database V1 successfully initialized' as status;
