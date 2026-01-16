-- ============================================
-- MIGRACIÓN 005: Tabla de Noticias y Anuncios
-- JAC Barrio San José y El Bosque - Armenia, Quindío
-- ============================================

CREATE TYPE noticia_categoria AS ENUM (
  'aviso',
  'noticia',
  'comunicado',
  'urgente',
  'fallecimiento',
  'celebracion'
);

CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  resumen VARCHAR(500),
  categoria noticia_categoria DEFAULT 'noticia',
  imagen_url VARCHAR(500),
  fecha_publicacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ,
  destacada BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  autor VARCHAR(255),
  vistas INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Índices
CREATE INDEX idx_noticias_fecha ON noticias (fecha_publicacion DESC);
CREATE INDEX idx_noticias_categoria ON noticias (categoria);
CREATE INDEX idx_noticias_activa ON noticias (activa);
CREATE INDEX idx_noticias_destacada ON noticias (destacada);

-- Trigger para updated_at
CREATE TRIGGER update_noticias_updated_at
BEFORE UPDATE ON noticias
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;

-- Política: Noticias activas y no expiradas son públicas
CREATE POLICY "Noticias activas son públicas"
ON noticias
FOR SELECT
TO public
USING (
  activa = true
  AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
);

-- Política: Administración para service role
CREATE POLICY "Service role administra noticias"
ON noticias
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Vista: Noticias recientes
CREATE OR REPLACE VIEW noticias_recientes AS
SELECT *
FROM noticias
WHERE activa = true
  AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
ORDER BY destacada DESC, fecha_publicacion DESC
LIMIT 10;
