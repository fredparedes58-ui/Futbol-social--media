-- ============================================================
-- SETUP: SUPABASE STORAGE PARA MEDIA (FOTOS / VIDEOS / AUDIOS)
-- ============================================================
-- Configura los cubos de almacenamiento y sus políticas RLS
-- ============================================================

-- 1. CREAR BUCKETS (CUBOS) DE ALMACENAMIENTO
-- ============================================================

-- Bucket principal para fotos de perfil, imágenes de posts y archivos de chat
INSERT INTO storage.buckets (id, name, public) 
VALUES ('social_media', 'social_media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', false) -- Privado por seguridad en chats
ON CONFLICT (id) DO NOTHING;


-- 2. POLÍTICAS DE ACCESO PARA SOCIAL_MEDIA (Archivos de la Feed Pública/Del Equipo)
-- ============================================================
-- Asegurarse de habilitar el RLS en el Storage
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Lectura: Cualquiera (public) puede ver las imágenes del feed
DROP POLICY IF EXISTS "Public Acces TO social_media read" ON storage.objects;
CREATE POLICY "Public Acces TO social_media read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'social_media' );

-- Inserción: Solo usuarios autenticados pueden subir fotos al feed social
DROP POLICY IF EXISTS "Only Auth Insert TO social_media" ON storage.objects;
CREATE POLICY "Only Auth Insert TO social_media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'social_media' 
  AND auth.role() = 'authenticated'
);

-- Borrado/Actualización: Solo el dueño de la imagen puede borrarla o reemplazarla
DROP POLICY IF EXISTS "Only Owner Update Delete TO social_media" ON storage.objects;
CREATE POLICY "Only Owner Update Delete TO social_media"
ON storage.objects FOR ALL
USING (
  bucket_id = 'social_media' 
  AND auth.uid() = owner
);


-- 3. POLÍTICAS DE ACCESO PARA CHAT_ATTACHMENTS (Imágenes/Audios privados)
-- ============================================================

-- Lectura: Solo usuarios autenticados pueden leer adjuntos del chat
DROP POLICY IF EXISTS "Auth Read TO chat_attachments" ON storage.objects;
CREATE POLICY "Auth Read TO chat_attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat_attachments'
  AND auth.role() = 'authenticated'
);

-- Inserción: Solo usuarios autenticados pueden subir adjuntos al chat
DROP POLICY IF EXISTS "Only Auth Insert TO chat_attachments" ON storage.objects;
CREATE POLICY "Only Auth Insert TO chat_attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat_attachments' 
  AND auth.role() = 'authenticated'
);

-- Borrado: Solo el dueño del archivo (quien lo mandó al chat) puede borrar su adjunto
DROP POLICY IF EXISTS "Only Owner Delete TO chat_attachments" ON storage.objects;
CREATE POLICY "Only Owner Delete TO chat_attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat_attachments' 
  AND auth.uid() = owner
);

-- RECOMENDACIÓN PARA EL CHAT:
-- Para chats 1 a 1 de alta privacidad, idealmente se usarían URLs firmadas de lectura
-- Sin embargo, las políticas anteriores asumen que quien abra la URL (usuario autenticado) 
-- es miembro legítimo.

SELECT 'Buckets y Políticas generadas exitosamente' as status;
