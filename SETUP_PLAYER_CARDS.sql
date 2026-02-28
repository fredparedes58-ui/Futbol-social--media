-- ============================================================
-- SETUP PLAYER CARDS (FIFA STYLE) - EXPANSION 3 (PART 2)
-- ============================================================
-- Modificaremos la tabla 'profiles' existente para añadir 
-- las métricas deportivas y la posición preferida del jugador.
-- ============================================================

-- 1. Añadir columnas a la tabla perfiles (sin borrar datos actuales)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS position VARCHAR(5) DEFAULT 'MID', -- Posiciones: GK, DEF, MID, FWD
ADD COLUMN IF NOT EXISTS stat_pace INTEGER DEFAULT 50 CHECK (stat_pace BETWEEN 1 AND 99),
ADD COLUMN IF NOT EXISTS stat_shooting INTEGER DEFAULT 50 CHECK (stat_shooting BETWEEN 1 AND 99),
ADD COLUMN IF NOT EXISTS stat_passing INTEGER DEFAULT 50 CHECK (stat_passing BETWEEN 1 AND 99),
ADD COLUMN IF NOT EXISTS stat_dribbling INTEGER DEFAULT 50 CHECK (stat_dribbling BETWEEN 1 AND 99),
ADD COLUMN IF NOT EXISTS stat_defending INTEGER DEFAULT 50 CHECK (stat_defending BETWEEN 1 AND 99),
ADD COLUMN IF NOT EXISTS stat_physical INTEGER DEFAULT 50 CHECK (stat_physical BETWEEN 1 AND 99);

-- 2. Columna calculada automáticamente (Overall Rating)
-- Formula sencilla: Promedio de las 6 stats
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS overall_rating INTEGER GENERATED ALWAYS AS (
    (stat_pace + stat_shooting + stat_passing + stat_dribbling + stat_defending + stat_physical) / 6
) STORED;

-- Nota de Seguridad: 
-- Como ya existe una política en 'profiles' que dice:
-- "Users can update their own profile" (Los usuarios pueden actualizar su propio perfil),
-- no necesitamos crear nuevas políticas RLS. Los padres ya podrán editar estos nuevos campos
-- directamente desde la app en EditProfileScreen usando su propio token JWT.

SELECT 'Player Cards Database V1 successfully updated' as status;
