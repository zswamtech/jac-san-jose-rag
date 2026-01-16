-- =============================================
-- MIGRACIÓN 006: Datos geográficos de negocios
-- JAC Barrio San José y El Bosque
-- =============================================

-- Habilitar PostGIS si no está habilitado
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla para negocios geocodificados
CREATE TABLE IF NOT EXISTS negocios_geo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT,
    categoria TEXT,
    subcategoria TEXT,
    telefono TEXT,
    horario TEXT,
    descripcion TEXT,
    
    -- Columnas geográficas
    ubicacion GEOGRAPHY(POINT, 4326),  -- WGS84
    precision TEXT CHECK (precision IN ('interpolado', 'centroide', 'manual', 'verificado')),
    metodo_geocoding TEXT,
    
    -- Asociación con Fishnet
    fishnet_cell_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    geocoded_at TIMESTAMPTZ
);

-- Índice espacial para búsquedas geográficas
CREATE INDEX IF NOT EXISTS idx_negocios_geo_ubicacion 
    ON negocios_geo USING GIST (ubicacion);

-- Índice para búsquedas por celda del Fishnet
CREATE INDEX IF NOT EXISTS idx_negocios_geo_fishnet 
    ON negocios_geo (fishnet_cell_id);

-- Índice para categorías
CREATE INDEX IF NOT EXISTS idx_negocios_geo_categoria 
    ON negocios_geo (categoria);

-- Tabla para el Fishnet (grilla de análisis)
CREATE TABLE IF NOT EXISTS fishnet_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id TEXT UNIQUE NOT NULL,
    row_num INTEGER NOT NULL,
    col_num INTEGER NOT NULL,
    
    -- Geometría de la celda
    geometry GEOGRAPHY(POLYGON, 4326),
    centroide GEOGRAPHY(POINT, 4326),
    
    -- Estadísticas
    area_m2 NUMERIC,
    num_negocios INTEGER DEFAULT 0,
    
    -- Datos adicionales
    zona TEXT,  -- 'san_jose', 'el_bosque', 'mixta'
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para el Fishnet
CREATE INDEX IF NOT EXISTS idx_fishnet_geometry 
    ON fishnet_cells USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_fishnet_centroide 
    ON fishnet_cells USING GIST (centroide);

-- Tabla para POIs verificados
CREATE TABLE IF NOT EXISTS pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,  -- 'deportivo', 'religioso', 'cultural', 'educacion', 'patrimonio'
    descripcion TEXT,
    
    -- Ubicación
    ubicacion GEOGRAPHY(POINT, 4326),
    
    -- Metadata
    icono TEXT,
    verificado BOOLEAN DEFAULT true,
    fuente TEXT DEFAULT 'gemini_verification',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pois_ubicacion 
    ON pois USING GIST (ubicacion);

CREATE INDEX IF NOT EXISTS idx_pois_tipo 
    ON pois (tipo);

-- Tabla para límites de barrios
CREATE TABLE IF NOT EXISTS barrios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT UNIQUE NOT NULL,
    comuna TEXT,
    descripcion TEXT,
    
    -- Geometría
    limite GEOGRAPHY(POLYGON, 4326),
    centroide GEOGRAPHY(POINT, 4326),
    
    -- Estadísticas
    area_hectareas NUMERIC,
    num_habitantes INTEGER,
    num_negocios INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barrios_limite 
    ON barrios USING GIST (limite);

-- =============================================
-- FUNCIONES ESPACIALES
-- =============================================

-- Función para buscar negocios cercanos
CREATE OR REPLACE FUNCTION buscar_negocios_cercanos(
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    radio_metros INTEGER DEFAULT 500,
    limite INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    negocio_id TEXT,
    nombre TEXT,
    direccion TEXT,
    categoria TEXT,
    distancia_metros DOUBLE PRECISION
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        ng.id,
        ng.negocio_id,
        ng.nombre,
        ng.direccion,
        ng.categoria,
        ST_Distance(
            ng.ubicacion,
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) AS distancia_metros
    FROM negocios_geo ng
    WHERE ST_DWithin(
        ng.ubicacion,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
        radio_metros
    )
    ORDER BY distancia_metros
    LIMIT limite;
$$;

-- Función para obtener negocios en una celda del Fishnet
CREATE OR REPLACE FUNCTION negocios_en_celda(cell_id_param TEXT)
RETURNS TABLE (
    id UUID,
    negocio_id TEXT,
    nombre TEXT,
    categoria TEXT
)
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        ng.id,
        ng.negocio_id,
        ng.nombre,
        ng.categoria
    FROM negocios_geo ng
    WHERE ng.fishnet_cell_id = cell_id_param;
$$;

-- Función para estadísticas de un área
CREATE OR REPLACE FUNCTION estadisticas_area(
    lat_min DOUBLE PRECISION,
    lon_min DOUBLE PRECISION,
    lat_max DOUBLE PRECISION,
    lon_max DOUBLE PRECISION
)
RETURNS TABLE (
    total_negocios BIGINT,
    categorias JSONB
)
LANGUAGE SQL
STABLE
AS $$
    WITH area_bbox AS (
        SELECT ST_MakeEnvelope(lon_min, lat_min, lon_max, lat_max, 4326)::geography AS bbox
    ),
    negocios_en_area AS (
        SELECT ng.*
        FROM negocios_geo ng, area_bbox ab
        WHERE ST_Intersects(ng.ubicacion, ab.bbox)
    )
    SELECT 
        COUNT(*)::BIGINT AS total_negocios,
        jsonb_object_agg(
            COALESCE(categoria, 'Sin categoría'),
            cnt
        ) AS categorias
    FROM (
        SELECT categoria, COUNT(*) AS cnt
        FROM negocios_en_area
        GROUP BY categoria
    ) subq;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER negocios_geo_updated_at
    BEFORE UPDATE ON negocios_geo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para actualizar conteo de negocios en celdas
CREATE OR REPLACE FUNCTION update_fishnet_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE fishnet_cells
        SET num_negocios = (
            SELECT COUNT(*) FROM negocios_geo 
            WHERE fishnet_cell_id = NEW.fishnet_cell_id
        )
        WHERE cell_id = NEW.fishnet_cell_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE fishnet_cells
        SET num_negocios = (
            SELECT COUNT(*) FROM negocios_geo 
            WHERE fishnet_cell_id = OLD.fishnet_cell_id
        )
        WHERE cell_id = OLD.fishnet_cell_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER negocios_geo_fishnet_count
    AFTER INSERT OR UPDATE OR DELETE ON negocios_geo
    FOR EACH ROW
    EXECUTE FUNCTION update_fishnet_count();

-- =============================================
-- COMENTARIOS
-- =============================================

COMMENT ON TABLE negocios_geo IS 'Negocios geocodificados del Barrio San José y El Bosque';
COMMENT ON TABLE fishnet_cells IS 'Grilla de análisis espacial 50m x 50m';
COMMENT ON TABLE pois IS 'Puntos de interés verificados del barrio';
COMMENT ON TABLE barrios IS 'Límites geográficos de los barrios';
COMMENT ON FUNCTION buscar_negocios_cercanos IS 'Busca negocios dentro de un radio dado';
COMMENT ON FUNCTION negocios_en_celda IS 'Lista negocios en una celda del Fishnet';
COMMENT ON FUNCTION estadisticas_area IS 'Estadísticas de negocios en un área rectangular';
