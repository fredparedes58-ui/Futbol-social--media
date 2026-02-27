-- ============================================================
-- SETUP_SOCIAL_COMMENTS.sql
-- ============================================================
-- 1. Crear tabla de comentarios (social_post_comments)
-- 2. Añadir contador 'comments_count' a social_posts
-- 3. Crear constraints, índices y Row Level Security (RLS)
-- 4. Triggers para actualizar 'comments_count' automáticamente
-- ============================================================

-- IMPORTANTE: Usamos IF NOT EXISTS para que sea seguro ejecutarlo múltiples veces

-- 1. Añadir el campo comments_count a la tabla social_posts si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='social_posts' AND column_name='comments_count'
    ) THEN
        ALTER TABLE public.social_posts ADD COLUMN comments_count INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- 2. Crear la tabla de comentarios
CREATE TABLE IF NOT EXISTS public.social_post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;

-- 4. Crear Políticas (Policies)
-- Cualquiera puede ver los comentarios (asumiendo que ven el post)
DROP POLICY IF EXISTS "Todos pueden ver comentarios" ON public.social_post_comments;
CREATE POLICY "Todos pueden ver comentarios" 
ON public.social_post_comments FOR SELECT 
USING (true);

-- Usuarios autenticados pueden crear comentarios
DROP POLICY IF EXISTS "Usuarios autenticados pueden comentar" ON public.social_post_comments;
CREATE POLICY "Usuarios autenticados pueden comentar" 
ON public.social_post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Solo el autor o un admin puede borrar el comentario
-- (Para simplicidad, solo el autor puede borrar su comentario por ahora)
DROP POLICY IF EXISTS "Usuarios pueden borrar sus propios comentarios" ON public.social_post_comments;
CREATE POLICY "Usuarios pueden borrar sus propios comentarios" 
ON public.social_post_comments FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Crear Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_social_post_comments_post_id ON public.social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_comments_created_at ON public.social_post_comments(created_at DESC);

-- ============================================================
-- 6. TRIGGERS PARA EL CONTADOR DE COMENTARIOS
-- ============================================================

-- Función Trigger: Incrementa o decrementa el comments_count en social_posts
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.social_posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.social_posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Insert
DROP TRIGGER IF EXISTS trigger_increment_comments_count ON public.social_post_comments;
CREATE TRIGGER trigger_increment_comments_count
    AFTER INSERT ON public.social_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comments_count();

-- Trigger: Delete
DROP TRIGGER IF EXISTS trigger_decrement_comments_count ON public.social_post_comments;
CREATE TRIGGER trigger_decrement_comments_count
    AFTER DELETE ON public.social_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comments_count();

-- ============================================================
-- 7. VISTA RECOMENDADA (CON DETALLES DEL AUTOR)
-- ============================================================
-- Para poder obtener el nombre y rol del que comenta fácilmente
DROP VIEW IF EXISTS public.social_comments_detailed;
CREATE OR REPLACE VIEW public.social_comments_detailed AS
SELECT 
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    p.full_name as author_name,
    p.role as author_role
FROM 
    public.social_post_comments c
LEFT JOIN 
    public.profiles p ON c.user_id = p.id;

-- Éxito!
