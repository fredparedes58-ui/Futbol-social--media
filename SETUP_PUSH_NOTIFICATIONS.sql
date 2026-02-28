-- ============================================================
-- SETUP PUSH NOTIFICATIONS - Tokens FCM y Log de Notificaciones
-- ============================================================
-- Ejecutar DESPUÉS de SETUP_LIGA_HUB_PREMIUM.sql
-- ============================================================

-- 1. Tabla de tokens FCM de cada dispositivo/usuario
CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,           -- FCM token del dispositivo
    platform TEXT DEFAULT 'mobile'        -- 'android', 'ios', 'web'
        CHECK (platform IN ('android', 'ios', 'web', 'mobile')),
    active BOOLEAN DEFAULT true,          -- false cuando el token expira
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuario gestiona su propio token" ON public.device_tokens;
CREATE POLICY "Usuario gestiona su propio token"
    ON public.device_tokens FOR ALL
    USING (auth.uid() = user_id);

-- Service role puede leer todos los tokens (para el Edge Function)
DROP POLICY IF EXISTS "Service role lee todos los tokens" ON public.device_tokens;
CREATE POLICY "Service role lee todos los tokens"
    ON public.device_tokens FOR SELECT
    USING (auth.role() = 'service_role');


-- 2. Tabla de log de notificaciones enviadas
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,                   -- 'resultado', 'horario', 'nuevo_partido'
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    id_partido TEXT,
    tokens_sent INTEGER DEFAULT 0,
    fcm_success INTEGER DEFAULT 0,
    fcm_failure INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins leen el log de notificaciones" ON public.notification_log;
CREATE POLICY "Admins leen el log de notificaciones"
    ON public.notification_log FOR SELECT
    USING (auth.uid() IS NOT NULL);


-- 3. Columnas de control en ffcv_fixtures para detectar cambios
ALTER TABLE public.ffcv_fixtures
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 0;

-- 4. Función para actualizar el sync_version automáticamente (trigger)
CREATE OR REPLACE FUNCTION public.increment_fixture_version()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sync_version := COALESCE(OLD.sync_version, 0) + 1;
    NEW.last_synced_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_fixture_update ON public.ffcv_fixtures;
CREATE TRIGGER on_fixture_update
    BEFORE UPDATE ON public.ffcv_fixtures
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_fixture_version();

-- 5. Habilitar REALTIME en las tablas que la app Flutter escuchará
-- (Ejecutar en Supabase Dashboard → Database → Replication → Add table)
-- O via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.ffcv_fixtures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ffcv_standings;

SELECT 'Push Notifications + Realtime configurados correctamente' AS status;
