-- ============================================================
-- SETUP_NOTIFICATIONS.sql
-- ============================================================
-- 1. Crear tabla de notificaciones
-- 2. Crear vista enriquecida para la UI
-- 3. Crear triggers para "Likes"
-- 4. Crear triggers para "Comments"
-- ============================================================

-- 1. TABLA BASE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Quien recibe
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,     -- Quien hizo la acción
    
    type TEXT NOT NULL CHECK (type IN ('like_post', 'comment_post', 'new_message', 'new_story')),
    
    entity_id UUID, -- ID del post, del mensaje, o del story
    entity_type TEXT CHECK (entity_type IN ('post', 'message', 'story')),
    
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notifications;
CREATE POLICY "Usuarios ven sus propias notificaciones" 
ON public.notifications FOR SELECT 
USING (auth.uid() = recipient_id);

-- Políticas de actualización (marcar como leídas)
DROP POLICY IF EXISTS "Usuarios actualizan sus propias notificaciones" ON public.notifications;
CREATE POLICY "Usuarios actualizan sus propias notificaciones" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = recipient_id);

-- 2. VISTA DETALLADA
-- ============================================================
DROP VIEW IF EXISTS public.notifications_detailed;
CREATE OR REPLACE VIEW public.notifications_detailed AS
SELECT 
    n.id,
    n.recipient_id,
    n.actor_id,
    n.type,
    n.entity_id,
    n.entity_type,
    n.is_read,
    n.created_at,
    p.full_name as actor_name,
    p.avatar_url as actor_avatar_url,
    
    -- Dependiendo del tipo, traemos la foto del post para mostrarla chiquita al lado
    CASE 
        WHEN n.entity_type = 'post' THEN (SELECT media_url FROM social_posts WHERE id = n.entity_id)
        ELSE NULL
    END as entity_preview_url

FROM 
    public.notifications n
JOIN 
    public.profiles p ON n.actor_id = p.id
ORDER BY 
    n.created_at DESC;


-- 3. TRIGGERS: LIKES
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Obtenemos el dueño del post
    SELECT user_id INTO post_owner_id FROM public.social_posts WHERE id = NEW.post_id;
    
    -- No notificar si yo le doy like a mi propio post
    IF post_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, entity_id, entity_type)
        VALUES (post_owner_id, NEW.user_id, 'like_post', NEW.post_id, 'post');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_new_like_notification ON public.social_post_likes;
CREATE TRIGGER tr_new_like_notification
    AFTER INSERT ON public.social_post_likes
    FOR EACH ROW EXECUTE FUNCTION handle_new_like_notification();


-- 4. TRIGGERS: COMMENTS
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
BEGIN
    -- Obtenemos el dueño del post
    SELECT user_id INTO post_owner_id FROM public.social_posts WHERE id = NEW.post_id;
    
    -- No notificar si yo comento mi propio post
    IF post_owner_id != NEW.user_id THEN
        INSERT INTO public.notifications (recipient_id, actor_id, type, entity_id, entity_type)
        VALUES (post_owner_id, NEW.user_id, 'comment_post', NEW.post_id, 'post');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_new_comment_notification ON public.social_post_comments;
CREATE TRIGGER tr_new_comment_notification
    AFTER INSERT ON public.social_post_comments
    FOR EACH ROW EXECUTE FUNCTION handle_new_comment_notification();


-- Extra: Marcar todas como leídas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.notifications
  SET is_read = true
  WHERE recipient_id = p_user_id AND is_read = false;
$$;

SELECT 'Sistema de Notificaciones In-App creado exitosamente' as status;
